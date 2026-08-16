"""Admin (JWT protected) content-management endpoints."""
import base64
import random
import re
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict

import db as D
from auth import (
    client_ip,
    current_admin,
    generate_totp_secret,
    hash_password,
    totp_provisioning_uri,
    totp_qr_data_uri,
    verify_password,
)

router = APIRouter(dependencies=[Depends(current_admin)])

MAX_IMAGE_BYTES = 8 * 1024 * 1024
ALLOWED_EXT = {"png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif", "ico"}


def _decode_image(image_base64: str, original_name: str = "image") -> Dict[str, Any]:
    match = re.match(r"^data:image/([a-zA-Z0-9+.\-]+);base64,(.+)$", image_base64 or "", re.S)
    ext = "png"
    payload = image_base64 or ""
    content_type = "image/png"
    if match:
        detected = match.group(1).lower()
        content_type = f"image/{detected}"
        ext = "jpg" if detected == "jpeg" else re.sub(r"[^a-z0-9]", "", detected)
        payload = match.group(2)
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Format gambar .{ext} tidak didukung.")
    try:
        raw = base64.b64decode(payload)
    except Exception:
        raise HTTPException(status_code=400, detail="Data gambar base64 tidak valid.")
    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Ukuran gambar melebihi batas 8 MB.")
    clean = re.sub(r"[^a-z0-9]", "_", (original_name or "image").rsplit(".", 1)[0].lower())[:20] or "image"
    filename = f"{clean}_{random.randint(100000, 999999)}.{ext}"
    return {"filename": filename, "data": raw, "contentType": content_type, "size": len(raw), "ext": ext}


async def _store_asset(image_base64: str, original_name: str, category: str, admin_user: str) -> Dict[str, Any]:
    info = _decode_image(image_base64, original_name)
    doc = {
        "id": f"ASSET-{random.randint(100000, 999999)}",
        "filename": info["filename"],
        "originalName": original_name or info["filename"],
        "contentType": info["contentType"],
        "size": info["size"],
        "category": category,
        "url": f"/api/uploads/{info['filename']}",
        "data": info["data"],
        "uploadedBy": admin_user,
        "createdAt": D.now(),
    }
    await D.galleryassets.insert_one(dict(doc))
    meta = {k: v for k, v in doc.items() if k != "data"}
    return D.serialize(meta)


# --------------------------------------------------------------------------- #
# ADMIN CREDENTIALS & 2FA
# --------------------------------------------------------------------------- #
class CredentialsBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    newUsername: Optional[str] = None
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = None
    google2faEnabled: Optional[bool] = None
    google2faSecret: Optional[str] = None
    sessionTimeout: Optional[str] = None
    ipWhitelist: Optional[str] = None


@router.get("/admin/credentials")
async def get_credentials():
    admin = await D.adminusers.find_one({})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin belum terdaftar")
    secret = admin.get("google2faSecret") or generate_totp_secret()
    if not admin.get("google2faSecret"):
        await D.adminusers.update_one({"_id": admin["_id"]}, {"$set": {"google2faSecret": secret}})
    username = admin.get("username", "admin")
    return {
        "username": username,
        "google2faEnabled": bool(admin.get("google2faEnabled")),
        "google2faSecret": secret,
        "google2faOtpAuthUrl": totp_provisioning_uri(secret, username),
        "sessionTimeout": admin.get("sessionTimeout") or "24 Hours",
        "ipWhitelist": admin.get("ipWhitelist") or "",
        "loginAlerts": bool(admin.get("loginAlerts", True)),
    }


@router.get("/admin/2fa/qr")
async def get_2fa_qr():
    admin = await D.adminusers.find_one({})
    secret = (admin or {}).get("google2faSecret") or generate_totp_secret()
    username = (admin or {}).get("username", "admin")
    return {
        "success": True,
        "secret": secret,
        "otpauthUrl": totp_provisioning_uri(secret, username),
        "qrDataUri": totp_qr_data_uri(secret, username),
    }


@router.post("/admin/2fa/generate-secret")
async def regenerate_2fa_secret(user: dict = Depends(current_admin)):
    admin = await D.adminusers.find_one({})
    secret = generate_totp_secret()
    await D.adminusers.update_one({"_id": admin["_id"]}, {"$set": {"google2faSecret": secret}})
    username = admin.get("username", "admin")
    await D.log_activity(
        "UPDATE", "WARNING", "ADMIN", "Secret 2FA Diperbarui",
        "Admin membuat ulang secret Google Authenticator", None, "127.0.0.1", username,
    )
    return {
        "success": True,
        "message": "Secret 2FA baru berhasil dibuat. Scan ulang QR di Google Authenticator!",
        "secret": secret,
        "otpauthUrl": totp_provisioning_uri(secret, username),
        "qrDataUri": totp_qr_data_uri(secret, username),
    }


@router.put("/admin/credentials")
async def update_credentials(body: CredentialsBody, request: Request):
    admin = await D.adminusers.find_one({})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin belum terdaftar")

    updates: Dict[str, Any] = {}
    wants_sensitive_change = bool(body.newUsername or body.newPassword)

    if wants_sensitive_change:
        if not body.currentPassword:
            raise HTTPException(status_code=400, detail="Password saat ini wajib diisi!")
        if not verify_password(body.currentPassword, admin.get("passwordHash", "")):
            raise HTTPException(status_code=400, detail="Password saat ini salah!")
    elif body.currentPassword and not verify_password(body.currentPassword, admin.get("passwordHash", "")):
        raise HTTPException(status_code=400, detail="Password saat ini salah!")

    if body.newUsername:
        updates["username"] = body.newUsername.strip()
    if body.newPassword:
        if len(body.newPassword) < 4:
            raise HTTPException(status_code=400, detail="Password baru minimal 4 karakter.")
        updates["passwordHash"] = hash_password(body.newPassword)
    if body.google2faEnabled is not None:
        updates["google2faEnabled"] = bool(body.google2faEnabled)
    if body.google2faSecret:
        updates["google2faSecret"] = body.google2faSecret.strip()
    if body.sessionTimeout:
        updates["sessionTimeout"] = body.sessionTimeout
    if body.ipWhitelist is not None:
        updates["ipWhitelist"] = body.ipWhitelist

    if updates:
        await D.adminusers.update_one({"_id": admin["_id"]}, {"$set": updates})

    fresh = await D.adminusers.find_one({"_id": admin["_id"]})
    await D.log_activity(
        "UPDATE", "SUCCESS", "ADMIN", "Kredensial & Keamanan Admin Diperbarui",
        "Admin memperbarui username/password/2FA/IP whitelist",
        {"fields": list(updates.keys())}, client_ip(request), fresh.get("username", "admin"),
    )
    return {
        "success": True,
        "message": "Pengaturan Kredensial & Keamanan Admin berhasil disimpan ke MongoDB!",
        "admin": {
            "username": fresh.get("username"),
            "google2faEnabled": bool(fresh.get("google2faEnabled")),
        },
    }


# --------------------------------------------------------------------------- #
# LOGOS
# --------------------------------------------------------------------------- #
class LogoBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    assetKey: str
    newPath: Optional[str] = ""
    actionType: Optional[str] = "UPDATE_LOGO"


@router.put("/config/logos")
async def update_logos(body: LogoBody, request: Request, user: dict = Depends(current_admin)):
    conf = await D.logoconfigs.find_one({"key": "global_logos"})
    current = (conf or {}).get("data") or dict(D.DEFAULT_LOGOS)
    if body.assetKey not in current:
        raise HTTPException(status_code=404, detail=f"Asset logo {body.assetKey} tidak ditemukan.")

    target = current[body.assetKey]
    old_path = target.get("path", "")
    initial_default = D.DEFAULT_LOGOS.get(body.assetKey, {}).get("path", "/logo_berkah.jpg")
    new_path = initial_default if body.actionType == "RESET" else (body.newPath or old_path)

    # If a base64 image was submitted, persist it in MongoDB gallery and use its URL
    if isinstance(new_path, str) and new_path.startswith("data:image/"):
        asset = await _store_asset(new_path, f"{body.assetKey}", "LOGO", user.get("username", "admin"))
        new_path = asset["url"]

    current[body.assetKey]["path"] = new_path

    log = {
        "id": f"LOG-L{random.randint(100, 999)}",
        "assetKey": body.assetKey,
        "assetName": target.get("name", body.assetKey),
        "location": target.get("location", ""),
        "action": body.actionType or "UPDATE_LOGO",
        "oldPath": (old_path[:40] + "... (Base64)") if len(old_path or "") > 50 else old_path,
        "newPath": (new_path[:40] + "... (Base64)") if len(new_path or "") > 50 else new_path,
        "adminUser": user.get("username", "admin"),
        "timestamp": D.now(),
    }
    await D.logoconfigs.update_one({"key": "global_logos"}, {"$set": {"data": current}}, upsert=True)
    await D.logologs.insert_one(dict(log))
    await D.log_activity(
        "UPDATE", "SUCCESS", "LOGO_ENGINE", "Logo Website Diperbarui",
        f"Logo {target.get('name')} diperbarui", {"assetKey": body.assetKey},
        client_ip(request), user.get("username", "admin"),
    )
    return {
        "success": True,
        "message": f"Logo {target.get('name')} berhasil diperbarui di MongoDB!",
        "logos": D.serialize(current),
        "log": D.serialize(log),
    }


@router.get("/admin/logo-logs")
async def logo_logs():
    items = await D.logologs.find({}).sort("timestamp", -1).to_list(length=50)
    return D.serialize(items)


# --------------------------------------------------------------------------- #
# RATES
# --------------------------------------------------------------------------- #
class RateBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    buyRate: Optional[float] = None
    sellRate: Optional[float] = None
    minUsdt: Optional[float] = None
    logType: Optional[str] = None


@router.put("/rates")
async def update_rates(body: RateBody, request: Request, user: dict = Depends(current_admin)):
    current = await D.rates.find_one({})
    if not current:
        current = {**D.DEFAULT_RATES, "updatedAt": D.now()}
        await D.rates.insert_one(dict(current))
        current = await D.rates.find_one({})

    old_buy = float(current.get("buyRate", 18000))
    old_sell = float(current.get("sellRate", 17000))
    new_buy = float(body.buyRate) if body.buyRate else old_buy
    new_sell = float(body.sellRate) if body.sellRate else old_sell
    new_min = float(body.minUsdt) if body.minUsdt else float(current.get("minUsdt", 10) or 10)

    updated = {"buyRate": new_buy, "sellRate": new_sell, "minUsdt": new_min, "updatedAt": D.now()}
    await D.rates.update_one({"_id": current["_id"]}, {"$set": updated})

    log_type = body.logType or ("RATE_BELI" if new_buy != old_buy else "RATE_JUAL")
    log = {
        "id": f"LOG-{random.randint(100, 999)}",
        "type": log_type,
        "oldRate": old_buy if log_type == "RATE_BELI" else old_sell,
        "newRate": new_buy if log_type == "RATE_BELI" else new_sell,
        "change": (new_buy - old_buy) if log_type == "RATE_BELI" else (new_sell - old_sell),
        "adminUser": user.get("username", "admin"),
        "timestamp": D.now(),
    }
    await D.ratelogs.insert_one(dict(log))

    chart_cfg = await D.get_setting("chart", D.DEFAULT_CHART_SETTINGS)
    if chart_cfg.get("autoAppendOnRateUpdate", True):
        await D.chartpoints.insert_one(
            {
                "id": f"CHART-{random.randint(100000, 999999)}",
                "label": D.now().strftime("%d %b %H:%M"),
                "buyRate": new_buy,
                "sellRate": new_sell,
                "timestamp": D.now(),
                "source": "RATE_UPDATE",
            }
        )

    await D.log_activity(
        "UPDATE", "SUCCESS", "RATE_ENGINE", "Kurs Beli & Jual Diperbarui",
        f"Beli: Rp {new_buy:,.0f} | Jual: Rp {new_sell:,.0f}",
        {"buyRate": new_buy, "sellRate": new_sell}, client_ip(request), user.get("username", "admin"),
    )
    return {
        "success": True,
        "message": "Rate berhasil diperbarui!",
        "rates": D.serialize(updated),
        "log": D.serialize(log),
    }


@router.get("/admin/rate-logs")
async def rate_logs():
    items = await D.ratelogs.find({}).sort("timestamp", -1).to_list(length=50)
    return D.serialize(items)


# --------------------------------------------------------------------------- #
# VISITOR ANALYTICS
# --------------------------------------------------------------------------- #
@router.get("/admin/visitor-analytics")
async def visitor_analytics():
    logs = await D.visitorlogs.find({}).sort("timestamp", -1).to_list(length=100)
    data = D.serialize(logs)
    total = len(data)
    today = D.now().strftime("%Y-%m-%d")
    today_count = len([l for l in data if str(l.get("timestamp", "")).startswith(today)])

    city_counts: Dict[str, int] = {}
    for l in data:
        key = f"{l.get('city')}|{l.get('country')}"
        city_counts[key] = city_counts.get(key, 0) + 1

    top_cities = []
    for key, count in city_counts.items():
        city, country = key.split("|", 1)
        top_cities.append(
            {
                "city": city,
                "country": country,
                "count": count,
                "percentage": round(count / total * 100, 1) if total else 0,
            }
        )
    top_cities.sort(key=lambda x: x["count"], reverse=True)

    mobile = desktop = tablet = 0
    for l in data:
        dev = str(l.get("device", "")).lower()
        if any(x in dev for x in ("mobile", "android", "iphone")):
            mobile += 1
        elif any(x in dev for x in ("tablet", "ipad")):
            tablet += 1
        else:
            desktop += 1

    # 7 day traffic trend for dashboard chart
    from datetime import timedelta

    trend = []
    for i in range(6, -1, -1):
        day = (D.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        count = len([l for l in data if str(l.get("timestamp", "")).startswith(day)])
        trend.append({"date": day, "label": (D.now() - timedelta(days=i)).strftime("%d %b"), "visitors": count})

    return {
        "totalVisitors": total,
        "todayVisitors": today_count,
        "topCities": top_cities,
        "deviceBreakdown": {
            "mobilePercent": round(mobile / total * 100, 1) if total else 0,
            "desktopPercent": round(desktop / total * 100, 1) if total else 0,
            "tabletPercent": round(tablet / total * 100, 1) if total else 0,
        },
        "trafficTrend": trend,
        "visitorLogs": data,
    }


# --------------------------------------------------------------------------- #
# ORDERS
# --------------------------------------------------------------------------- #
class OrderStatusBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: str = "PENDING"


@router.get("/orders")
async def list_orders():
    items = await D.orders.find({}).sort("createdAt", -1).to_list(length=500)
    return D.serialize(items)


@router.patch("/orders/{order_id}")
async def update_order(order_id: str, body: OrderStatusBody):
    await D.orders.update_one({"id": order_id}, {"$set": {"status": body.status}})
    return {"success": True, "message": f"Status order {order_id} diubah ke {body.status}"}


@router.delete("/orders/{order_id}")
async def delete_order(order_id: str):
    await D.orders.delete_one({"id": order_id})
    return {"success": True, "message": f"Order {order_id} dihapus!"}


# --------------------------------------------------------------------------- #
# POPUPS
# --------------------------------------------------------------------------- #
class PopupBody(BaseModel):
    model_config = ConfigDict(extra="allow")


@router.get("/admin/popups")
async def admin_popups():
    items = await D.popups.find({}).sort("updatedAt", -1).to_list(length=200)
    return {"success": True, "popups": D.serialize(items)}


@router.post("/admin/popups")
async def create_popup(body: PopupBody, request: Request, user: dict = Depends(current_admin)):
    payload = body.model_dump()
    doc = {
        "id": f"POP-{random.randint(100000, 999999)}",
        "title": payload.get("title") or "\U0001F525 PROMO SPESIAL OTC BERKAH USDT",
        "subtitle": payload.get("subtitle") or "",
        "description": payload.get("description") or "",
        "imageUrl": payload.get("imageUrl") or "/logo_berkah.jpg",
        "imageWidth": payload.get("imageWidth") or "medium",
        "imageAspectRatio": payload.get("imageAspectRatio") or "16/9",
        "badgeText": payload.get("badgeText") or "PENGUMUMAN",
        "accentColor": payload.get("accentColor") or "emerald",
        "buttonText": payload.get("buttonText") or "Hubungi Admin",
        "buttonUrl": payload.get("buttonUrl") or "https://wa.me/6281234567890",
        "buttonTarget": payload.get("buttonTarget") or "_blank",
        "isActive": bool(payload.get("isActive", True)),
        "autoCloseSeconds": int(payload.get("autoCloseSeconds") or 0),
        "showOncePerSession": bool(payload.get("showOncePerSession", True)),
        "viewsCount": 0,
        "clicksCount": 0,
        "createdAt": D.now(),
        "updatedAt": D.now(),
    }
    await D.popups.insert_one(dict(doc))
    await D.log_activity(
        "UPDATE", "SUCCESS", "POPUP_ENGINE", "Pop-Up Banner Baru Dibuat",
        f"Admin membuat banner pop-up '{doc['title']}'", {"popupId": doc["id"]},
        client_ip(request), user.get("username", "admin"),
    )
    return {"success": True, "message": "Pop-Up Banner baru berhasil ditambahkan!", "popup": D.serialize(doc)}


@router.put("/admin/popups/{popup_id}")
async def update_popup(popup_id: str, body: PopupBody, request: Request, user: dict = Depends(current_admin)):
    payload = {k: v for k, v in body.model_dump().items() if k not in ("_id", "id", "createdAt")}
    payload["updatedAt"] = D.now()
    await D.popups.update_one({"id": popup_id}, {"$set": payload})
    updated = await D.popups.find_one({"id": popup_id})
    await D.log_activity(
        "UPDATE", "SUCCESS", "POPUP_ENGINE", "Pop-Up Banner Diperbarui",
        f"Admin memperbarui pop-up '{payload.get('title', popup_id)}'", {"popupId": popup_id},
        client_ip(request), user.get("username", "admin"),
    )
    return {"success": True, "message": "Pop-Up Banner berhasil disimpan & diperbarui!", "popup": D.serialize(updated)}


@router.delete("/admin/popups/{popup_id}")
async def delete_popup(popup_id: str, request: Request, user: dict = Depends(current_admin)):
    await D.popups.delete_one({"id": popup_id})
    await D.log_activity(
        "UPDATE", "WARNING", "POPUP_ENGINE", "Pop-Up Banner Dihapus",
        f"Admin menghapus banner pop-up ID: {popup_id}", {"popupId": popup_id},
        client_ip(request), user.get("username", "admin"),
    )
    return {"success": True, "message": "Pop-Up Banner berhasil dihapus!"}


@router.patch("/admin/popups/{popup_id}/toggle")
async def toggle_popup(popup_id: str):
    doc = await D.popups.find_one({"id": popup_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Pop-up tidak ditemukan")
    new_status = not bool(doc.get("isActive"))
    await D.popups.update_one({"id": popup_id}, {"$set": {"isActive": new_status, "updatedAt": D.now()}})
    return {
        "success": True,
        "message": f"Status Pop-up berhasil diubah ke {'AKTIF' if new_status else 'NONAKTIF'}!",
        "isActive": new_status,
    }


# --------------------------------------------------------------------------- #
# IMAGE UPLOAD & GALLERY
# --------------------------------------------------------------------------- #
class UploadBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    imageBase64: str = ""
    originalName: str = "uploaded_image"
    category: str = "UMUM"


@router.post("/admin/upload-image")
async def upload_image(body: UploadBody, request: Request, user: dict = Depends(current_admin)):
    if not body.imageBase64:
        raise HTTPException(status_code=400, detail="Data gambar tidak ditemukan.")
    asset = await _store_asset(body.imageBase64, body.originalName, body.category, user.get("username", "admin"))
    await D.log_activity(
        "UPDATE", "SUCCESS", "UPLOAD_ENGINE", "Upload Gambar Berhasil",
        f"File '{asset['filename']}' tersimpan di MongoDB", {"url": asset["url"]},
        client_ip(request), user.get("username", "admin"),
    )
    return {
        "success": True,
        "imageUrl": asset["url"],
        "filename": asset["filename"],
        "asset": asset,
        "message": "Foto berhasil diunggah dari komputer & tersimpan di database!",
    }


class GalleryBatchBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    items: List[Dict[str, Any]] = []
    category: str = "GALERI"


@router.get("/admin/gallery")
async def list_gallery(category: str = "ALL", limit: int = 300):
    query: Dict[str, Any] = {}
    if category and category != "ALL":
        query["category"] = category
    items = await D.galleryassets.find(query, {"data": 0}).sort("createdAt", -1).to_list(length=limit)
    total_size = 0
    async for doc in D.galleryassets.find({}, {"size": 1}):
        total_size += int(doc.get("size") or 0)
    return {
        "success": True,
        "assets": D.serialize(items),
        "stats": {
            "total": await D.galleryassets.count_documents({}),
            "totalSizeKb": round(total_size / 1024, 1),
            "totalSizeMb": round(total_size / 1024 / 1024, 2),
        },
    }


@router.post("/admin/gallery")
async def upload_gallery(body: GalleryBatchBody, user: dict = Depends(current_admin)):
    if not body.items:
        raise HTTPException(status_code=400, detail="Tidak ada file gambar yang dikirim.")
    saved = []
    for item in body.items:
        image_b64 = item.get("imageBase64") or item.get("data") or ""
        if not image_b64:
            continue
        saved.append(
            await _store_asset(
                image_b64,
                item.get("filename") or item.get("originalName") or "galeri",
                item.get("category") or body.category,
                user.get("username", "admin"),
            )
        )
    if not saved:
        raise HTTPException(status_code=400, detail="Tidak ada file gambar valid yang dapat disimpan.")
    await D.log_activity(
        "UPDATE", "SUCCESS", "GALLERY_ENGINE", "Upload Galeri Berhasil",
        f"{len(saved)} gambar tersimpan ke database", {"count": len(saved)},
        "127.0.0.1", user.get("username", "admin"),
    )
    return {"success": True, "message": f"Berhasil mengunggah {len(saved)} gambar ke database!", "assets": saved}


@router.delete("/admin/gallery/{asset_id}")
async def delete_gallery_asset(asset_id: str):
    result = await D.galleryassets.delete_one({"id": asset_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Aset tidak ditemukan")
    return {"success": True, "message": "Aset gambar berhasil dihapus dari database!"}


class IdsBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ids: List[str] = []


@router.post("/admin/gallery/batch-delete")
async def batch_delete_gallery(body: IdsBody):
    if not body.ids:
        raise HTTPException(status_code=400, detail="Tidak ada aset yang dipilih.")
    result = await D.galleryassets.delete_many({"id": {"$in": body.ids}})
    return {"success": True, "message": f"Berhasil menghapus {result.deleted_count} aset gambar!"}


# --------------------------------------------------------------------------- #
# TESTIMONIALS
# --------------------------------------------------------------------------- #
@router.get("/admin/testimonials")
async def admin_testimonials():
    items = await D.testimonials.find({}).sort("createdAt", -1).to_list(length=1000)
    data = D.serialize(items)
    return {
        "success": True,
        "testimonials": data,
        "stats": {
            "total": len(data),
            "active": len([t for t in data if t.get("isActive")]),
            "row1Count": len([t for t in data if t.get("row") == 1]),
            "row2Count": len([t for t in data if t.get("row") == 2]),
            "withImages": len([t for t in data if t.get("imageUrl")]),
        },
    }


class TestiBatchBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    items: List[Dict[str, Any]] = []


@router.post("/admin/testimonials/batch-upload")
async def batch_upload_testimonials(body: TestiBatchBody, user: dict = Depends(current_admin)):
    if not body.items:
        raise HTTPException(status_code=400, detail="Tidak ada file foto testimoni yang dikirim.")
    saved = []
    for i, item in enumerate(body.items):
        image_url = item.get("imageUrl") or ""
        if item.get("imageBase64"):
            asset = await _store_asset(
                item["imageBase64"], item.get("filename") or f"testi_{i + 1}", "TESTIMONI",
                user.get("username", "admin"),
            )
            image_url = asset["url"]
        row = int(item.get("row") or (1 if i % 2 == 0 else 2))
        doc = {
            "id": f"TESTI-{random.randint(100000, 999999)}-{i + 1}",
            "title": item.get("title") or "Bukti Transaksi Selesai",
            "clientName": item.get("clientName") or f"Buyer OTC USDT #{random.randint(1000, 9999)}",
            "amount": item.get("amount") or f"-{random.randint(5, 300) * 100:,} USDT".replace(",", "."),
            "status": item.get("status") or "Completed",
            "imageUrl": image_url,
            "row": row,
            "rating": 5,
            "network": item.get("network") or "TRC-20",
            "badge": item.get("badge") or "VERIFIED USDT",
            "timestampText": "Completed",
            "isActive": True,
            "createdAt": D.now(),
        }
        await D.testimonials.insert_one(dict(doc))
        saved.append(D.serialize(doc))

    await D.log_activity(
        "UPDATE", "SUCCESS", "TESTIMONI_ENGINE", "Batch Upload Testimoni Berhasil",
        f"{len(saved)} foto testimoni tersimpan ke database", {"count": len(saved)},
        "127.0.0.1", user.get("username", "admin"),
    )
    return {
        "success": True,
        "message": f"Berhasil mengunggah {len(saved)} foto testimoni ke database!",
        "savedCount": len(saved),
        "testimonials": saved,
    }


class TestiBody(BaseModel):
    model_config = ConfigDict(extra="allow")


@router.post("/admin/testimonials")
async def create_testimonial(body: TestiBody, user: dict = Depends(current_admin)):
    payload = body.model_dump()
    image_url = payload.get("imageUrl") or ""
    if isinstance(image_url, str) and image_url.startswith("data:image/"):
        asset = await _store_asset(image_url, "testimoni", "TESTIMONI", user.get("username", "admin"))
        image_url = asset["url"]
    existing_id = payload.get("id")
    doc = {
        "id": existing_id or f"TESTI-{random.randint(100000, 999999)}",
        "title": payload.get("title") or "Bukti Transaksi Selesai",
        "clientName": payload.get("clientName") or "Buyer OTC USDT",
        "amount": payload.get("amount") or "-5.000 USDT",
        "status": payload.get("status") or "Completed",
        "imageUrl": image_url,
        "row": int(payload.get("row") or 1),
        "rating": 5,
        "network": payload.get("network") or "TRC-20",
        "badge": payload.get("badge") or "VERIFIED USDT",
        "timestampText": payload.get("status") or "Completed",
        "isActive": bool(payload.get("isActive", True)),
        "createdAt": D.now(),
    }
    if existing_id and await D.testimonials.count_documents({"id": existing_id}) > 0:
        update = {k: v for k, v in doc.items() if k != "createdAt"}
        await D.testimonials.update_one({"id": existing_id}, {"$set": update})
        message = "Testimoni berhasil diperbarui di database!"
    else:
        await D.testimonials.insert_one(dict(doc))
        message = "Testimoni berhasil disimpan ke database!"
    return {"success": True, "message": message, "testimonial": D.serialize(doc)}


@router.delete("/admin/testimonials/{testi_id}")
async def delete_testimonial(testi_id: str):
    await D.testimonials.delete_one({"id": testi_id})
    return {"success": True, "message": f"Testimoni '{testi_id}' berhasil dihapus!"}


@router.post("/admin/testimonials/batch-delete")
async def batch_delete_testimonials(body: IdsBody):
    if not body.ids:
        raise HTTPException(status_code=400, detail="Tidak ada ID testimoni yang dipilih.")
    result = await D.testimonials.delete_many({"id": {"$in": body.ids}})
    return {"success": True, "message": f"Berhasil menghapus {result.deleted_count} data testimoni!"}


@router.patch("/admin/testimonials/{testi_id}/toggle")
async def toggle_testimonial(testi_id: str):
    doc = await D.testimonials.find_one({"id": testi_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Testimoni tidak ditemukan")
    new_status = not bool(doc.get("isActive"))
    await D.testimonials.update_one({"id": testi_id}, {"$set": {"isActive": new_status}})
    return {
        "success": True,
        "message": f"Status testimoni diubah ke {'AKTIF' if new_status else 'NONAKTIF'}!",
        "isActive": new_status,
    }


@router.post("/admin/testimonials/reset-seed")
async def reset_testimonials():
    await D.testimonials.delete_many({})
    await D.testimonials.insert_many(D.default_seed_testimonials())
    return {"success": True, "message": "Berhasil me-reset data testimoni ke preset default!"}


# --------------------------------------------------------------------------- #
# SITE SETTINGS (CMS / SOCIAL / NETWORKS / CHART)
# --------------------------------------------------------------------------- #
class SettingBody(BaseModel):
    model_config = ConfigDict(extra="allow")


@router.get("/admin/settings/social")
async def admin_get_social():
    return {"success": True, "social": await D.get_setting("social", D.DEFAULT_SOCIAL)}


@router.put("/admin/settings/social")
async def admin_put_social(body: SettingBody, user: dict = Depends(current_admin)):
    current = await D.get_setting("social", D.DEFAULT_SOCIAL)
    payload = {k: v for k, v in body.model_dump().items() if not k.startswith("_")}
    current.update(payload)
    await D.save_setting("social", current)
    await D.log_activity(
        "UPDATE", "SUCCESS", "CMS", "Pengaturan Media Sosial Disimpan",
        "Admin memperbarui tautan media sosial & kontak", {"fields": list(payload.keys())},
        "127.0.0.1", user.get("username", "admin"),
    )
    return {"success": True, "message": "Pengaturan media sosial berhasil disimpan!", "social": current}


@router.get("/admin/settings/content")
async def admin_get_content():
    return {"success": True, "content": await D.get_setting("content", D.DEFAULT_CONTENT)}


@router.put("/admin/settings/content")
async def admin_put_content(body: SettingBody, user: dict = Depends(current_admin)):
    current = await D.get_setting("content", D.DEFAULT_CONTENT)
    payload = {k: v for k, v in body.model_dump().items() if not k.startswith("_")}
    for key, value in list(payload.items()):
        if isinstance(value, str) and value.startswith("data:image/"):
            asset = await _store_asset(value, key, "CMS", user.get("username", "admin"))
            payload[key] = asset["url"]
    current.update(payload)
    await D.save_setting("content", current)
    await D.log_activity(
        "UPDATE", "SUCCESS", "CMS", "Konten Tampilan Utama Disimpan",
        "Admin memperbarui teks/warna/logo halaman utama", {"fields": list(payload.keys())},
        "127.0.0.1", user.get("username", "admin"),
    )
    return {"success": True, "message": "Konten tampilan utama berhasil disimpan!", "content": current}


@router.post("/admin/settings/content/reset")
async def admin_reset_content():
    await D.save_setting("content", dict(D.DEFAULT_CONTENT))
    return {"success": True, "message": "Konten dikembalikan ke pengaturan awal!", "content": D.DEFAULT_CONTENT}


@router.get("/admin/settings/networks")
async def admin_get_networks():
    return {"success": True, "networks": await D.get_setting("networks", D.DEFAULT_NETWORKS)}


@router.put("/admin/settings/networks")
async def admin_put_networks(body: SettingBody, user: dict = Depends(current_admin)):
    current = await D.get_setting("networks", D.DEFAULT_NETWORKS)
    payload = {k: v for k, v in body.model_dump().items() if not k.startswith("_")}
    current.update(payload)
    await D.save_setting("networks", current)
    await D.log_activity(
        "UPDATE", "SUCCESS", "RATE_ENGINE", "Pengaturan Jaringan & Biaya Disimpan",
        f"Gratis fee mulai {current.get('freeFeeThresholdUsdt')} USDT", None,
        "127.0.0.1", user.get("username", "admin"),
    )
    return {"success": True, "message": "Pengaturan jaringan, biaya & metode pembayaran disimpan!", "networks": current}


@router.get("/admin/settings/chart")
async def admin_get_chart():
    settings = await D.get_setting("chart", D.DEFAULT_CHART_SETTINGS)
    points = await D.chartpoints.find({}, {"_id": 0}).sort("timestamp", 1).to_list(length=365)
    return {"success": True, "settings": settings, "points": D.serialize(points)}


@router.put("/admin/settings/chart")
async def admin_put_chart(body: SettingBody):
    current = await D.get_setting("chart", D.DEFAULT_CHART_SETTINGS)
    current.update({k: v for k, v in body.model_dump().items() if not k.startswith("_")})
    await D.save_setting("chart", current)
    return {"success": True, "message": "Pengaturan grafik berhasil disimpan!", "settings": current}


class ChartPointBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    label: Optional[str] = None
    buyRate: float = 0
    sellRate: float = 0


@router.post("/admin/settings/chart/points")
async def add_chart_point(body: ChartPointBody):
    doc = {
        "id": f"CHART-{random.randint(100000, 999999)}",
        "label": body.label or D.now().strftime("%d %b %H:%M"),
        "buyRate": float(body.buyRate or 0),
        "sellRate": float(body.sellRate or 0),
        "timestamp": D.now(),
        "source": "MANUAL",
    }
    await D.chartpoints.insert_one(dict(doc))
    return {"success": True, "message": "Titik data grafik berhasil ditambahkan!", "point": D.serialize(doc)}


@router.delete("/admin/settings/chart/points/{point_id}")
async def delete_chart_point(point_id: str):
    await D.chartpoints.delete_one({"id": point_id})
    return {"success": True, "message": "Titik data grafik dihapus!"}


@router.post("/admin/settings/chart/points/clear")
async def clear_chart_points():
    result = await D.chartpoints.delete_many({})
    return {"success": True, "message": f"{result.deleted_count} titik data grafik dibersihkan!"}
