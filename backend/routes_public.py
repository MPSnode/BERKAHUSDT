"""Public (unauthenticated) API endpoints consumed by the landing page."""
import base64
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict, Field

import db as D
from auth import (
    client_ip,
    create_token,
    hours_from_timeout,
    ip_allowed,
    verify_password,
    verify_totp,
)

router = APIRouter()


# --------------------------------------------------------------------------- #
# MODELS
# --------------------------------------------------------------------------- #
class LoginBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    username: str = ""
    password: str = ""
    totpCode: Optional[str] = None


class TrackBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    page: str = "/"


class OrderBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    type: str = "BUY"
    clientName: str = "Pelanggan OTC"
    phone: str = "-"
    amountUsdt: float = 0
    amountIdr: float = 0
    paymentMethod: str = "BCA Instant"
    walletAddress: str = "-"
    network: str = "TRC-20"


# --------------------------------------------------------------------------- #
# AUTH
# --------------------------------------------------------------------------- #
@router.post("/auth/login")
async def login(body: LoginBody, request: Request):
    ip = client_ip(request)
    admin = await D.adminusers.find_one({})
    if not admin:
        await D.ensure_seed()
        admin = await D.adminusers.find_one({})

    stored_hash = admin.get("passwordHash") or ""
    username_ok = body.username == admin.get("username")
    password_ok = verify_password(body.password, stored_hash)

    if not (username_ok and password_ok):
        await D.securitylogs.insert_one(
            {
                "id": f"SEC-{str(int(D.now().timestamp()))[-4:]}",
                "event": "Percobaan Login Admin Gagal",
                "type": "ADMIN_SECURITY",
                "severity": "WARNING",
                "ip": ip,
                "details": f"Username: {body.username}",
                "timestamp": D.now(),
            }
        )
        await D.log_activity(
            "AUTH", "WARNING", "AUTH", "Login Admin Gagal",
            "Percobaan login dengan kredensial salah", {"username": body.username}, ip, "GUEST",
        )
        raise HTTPException(status_code=401, detail="Username atau Password salah!")

    whitelist = admin.get("ipWhitelist") or ""
    if not ip_allowed(whitelist, ip):
        await D.securitylogs.insert_one(
            {
                "id": f"SEC-{str(int(D.now().timestamp()))[-4:]}",
                "event": "Login Ditolak oleh IP Whitelist",
                "type": "ADMIN_SECURITY",
                "severity": "WARNING",
                "ip": ip,
                "details": f"IP {ip} tidak terdaftar pada whitelist",
                "timestamp": D.now(),
            }
        )
        raise HTTPException(
            status_code=403,
            detail=f"Akses ditolak: IP {ip} tidak terdaftar di IP Whitelist Admin.",
        )

    if admin.get("google2faEnabled"):
        if not body.totpCode or not verify_totp(admin.get("google2faSecret") or "", body.totpCode):
            return {
                "success": False,
                "requires2FA": True,
                "message": (
                    "Kode 2FA tidak valid atau sudah kadaluwarsa. Silakan masukkan kode terbaru dari aplikasi Google Authenticator!"
                    if body.totpCode
                    else "Masukkan 6-digit kode Google Authenticator"
                ),
            }

    hours = hours_from_timeout(admin.get("sessionTimeout"))
    token = create_token(admin.get("username", "admin"), hours)

    await D.log_activity(
        "AUTH", "SUCCESS", "AUTH", "Admin Login Berhasil",
        "Super admin berhasil login dan menerima JWT session",
        {"username": admin.get("username")}, ip, admin.get("username", "admin"),
    )
    await D.securitylogs.insert_one(
        {
            "id": f"SEC-{str(int(D.now().timestamp()))[-4:]}",
            "event": "Admin Authentication Success",
            "type": "ADMIN_SECURITY",
            "severity": "SUCCESS",
            "ip": ip,
            "details": "Super Admin logged in with JWT Session",
            "timestamp": D.now(),
        }
    )

    return {
        "success": True,
        "token": token,
        "user": {
            "username": admin.get("username"),
            "role": "SUPER_ADMIN",
            "google2faEnabled": bool(admin.get("google2faEnabled")),
        },
    }


# --------------------------------------------------------------------------- #
# RATES / LOGOS
# --------------------------------------------------------------------------- #
@router.get("/rates")
async def get_rates():
    rate = await D.rates.find_one({})
    if not rate:
        doc = {**D.DEFAULT_RATES, "updatedAt": D.now()}
        await D.rates.insert_one(dict(doc))
        rate = doc
    return D.serialize(rate)


@router.get("/config/logos")
async def get_logos():
    conf = await D.logoconfigs.find_one({"key": "global_logos"})
    if conf and isinstance(conf.get("data"), dict):
        return D.serialize(conf["data"])
    return D.DEFAULT_LOGOS


# --------------------------------------------------------------------------- #
# DYNAMIC SITE SETTINGS (public read)
# --------------------------------------------------------------------------- #
@router.get("/settings/social")
async def public_social():
    data = await D.get_setting("social", D.DEFAULT_SOCIAL)
    # Only filled links are exposed to the landing page
    visible = {k: v for k, v in data.items() if isinstance(v, str) and v.strip()}
    return {"success": True, "social": visible, "all": data}


@router.get("/settings/content")
async def public_content():
    data = await D.get_setting("content", D.DEFAULT_CONTENT)
    return {"success": True, "content": data}


@router.get("/settings/networks")
async def public_networks():
    data = await D.get_setting("networks", D.DEFAULT_NETWORKS)
    networks = [n for n in data.get("networks", []) if n.get("isActive", True)]
    methods = [m for m in data.get("paymentMethods", []) if m.get("isActive", True)]
    return {
        "success": True,
        "freeFeeThresholdUsdt": data.get("freeFeeThresholdUsdt", 2000),
        "defaultNetwork": data.get("defaultNetwork", "TRC-20"),
        "networks": networks,
        "paymentMethods": methods,
    }


@router.get("/settings/all")
async def public_all_settings():
    content = await D.get_setting("content", D.DEFAULT_CONTENT)
    social = await D.get_setting("social", D.DEFAULT_SOCIAL)
    networks = await D.get_setting("networks", D.DEFAULT_NETWORKS)
    chart = await D.get_setting("chart", D.DEFAULT_CHART_SETTINGS)
    rate = await D.rates.find_one({}) or {**D.DEFAULT_RATES, "updatedAt": D.now()}
    logos = await D.logoconfigs.find_one({"key": "global_logos"})
    return {
        "success": True,
        "content": content,
        "social": {k: v for k, v in social.items() if isinstance(v, str) and v.strip()},
        "networks": [n for n in networks.get("networks", []) if n.get("isActive", True)],
        "paymentMethods": [m for m in networks.get("paymentMethods", []) if m.get("isActive", True)],
        "freeFeeThresholdUsdt": networks.get("freeFeeThresholdUsdt", 2000),
        "chartSettings": chart,
        "rates": D.serialize(rate),
        "logos": D.serialize((logos or {}).get("data") or D.DEFAULT_LOGOS),
    }


# --------------------------------------------------------------------------- #
# RATE HISTORY CHART (admin-configurable)
# --------------------------------------------------------------------------- #
@router.get("/chart/rates")
async def chart_rates(limit: int = 60):
    settings = await D.get_setting("chart", D.DEFAULT_CHART_SETTINGS)
    points = (
        await D.chartpoints.find({}, {"_id": 0}).sort("timestamp", 1).to_list(length=max(1, min(limit, 365)))
    )
    return {
        "success": True,
        "settings": settings,
        "points": D.serialize(points),
        "total": len(points),
    }


# --------------------------------------------------------------------------- #
# CALCULATOR QUOTE (fee rule: free gas fee when >= threshold USDT)
# --------------------------------------------------------------------------- #
@router.get("/calculator/quote")
async def calculator_quote(amountUsdt: float = 0, mode: str = "BUY", network: str = ""):
    rate_doc = await D.rates.find_one({}) or D.DEFAULT_RATES
    net_cfg = await D.get_setting("networks", D.DEFAULT_NETWORKS)
    threshold = float(net_cfg.get("freeFeeThresholdUsdt", 2000) or 2000)
    net_code = network or net_cfg.get("defaultNetwork", "TRC-20")
    net = next((n for n in net_cfg.get("networks", []) if n.get("code") == net_code), None)
    net_fee = float((net or {}).get("feeUsdt", 0) or 0)

    amount = max(0.0, float(amountUsdt or 0))
    is_free = amount >= threshold
    fee_usdt = 0.0 if is_free else net_fee
    rate = float(rate_doc.get("buyRate" if mode.upper() == "BUY" else "sellRate", 0) or 0)

    if mode.upper() == "BUY":
        total_usdt = amount + fee_usdt
        total_idr = total_usdt * rate
    else:
        total_usdt = max(0.0, amount - fee_usdt)
        total_idr = total_usdt * rate

    return {
        "success": True,
        "mode": mode.upper(),
        "network": net_code,
        "rate": rate,
        "amountUsdt": amount,
        "feeUsdt": fee_usdt,
        "feeFree": is_free,
        "freeFeeThresholdUsdt": threshold,
        "totalUsdt": round(total_usdt, 6),
        "totalIdr": round(total_idr, 2),
    }


# --------------------------------------------------------------------------- #
# VISITOR ANALYTICS TRACKING
# --------------------------------------------------------------------------- #
GEO_MAP = {
    "180.252": ("Jakarta", "Indonesia \U0001F1EE\U0001F1E9"),
    "114.122": ("Surabaya", "Indonesia \U0001F1EE\U0001F1E9"),
    "103.211": ("Medan", "Indonesia \U0001F1EE\U0001F1E9"),
    "182.253": ("Bandung", "Indonesia \U0001F1EE\U0001F1E9"),
    "139.192": ("Denpasar (Bali)", "Indonesia \U0001F1EE\U0001F1E9"),
    "110.137": ("Semarang", "Indonesia \U0001F1EE\U0001F1E9"),
    "180.244": ("Makassar", "Indonesia \U0001F1EE\U0001F1E9"),
    "103.10": ("Singapore", "Singapore \U0001F1F8\U0001F1EC"),
}
CITIES = [
    ("Jakarta", "Indonesia \U0001F1EE\U0001F1E9"),
    ("Surabaya", "Indonesia \U0001F1EE\U0001F1E9"),
    ("Medan", "Indonesia \U0001F1EE\U0001F1E9"),
    ("Bandung", "Indonesia \U0001F1EE\U0001F1E9"),
    ("Denpasar (Bali)", "Indonesia \U0001F1EE\U0001F1E9"),
    ("Semarang", "Indonesia \U0001F1EE\U0001F1E9"),
    ("Makassar", "Indonesia \U0001F1EE\U0001F1E9"),
]


def resolve_geo(ip: str):
    for prefix, loc in GEO_MAP.items():
        if ip.startswith(prefix):
            return loc
    h = 0
    for ch in ip:
        h = (h * 31 + ord(ch)) & 0xFFFFFFFF
    return CITIES[h % len(CITIES)]


@router.post("/analytics/track")
async def track(body: TrackBody, request: Request):
    ip = client_ip(request)
    user_agent = request.headers.get("user-agent", "Desktop Chrome (Windows)")
    city, country = resolve_geo(ip)

    last = await D.visitorlogs.find_one({}, sort=[("timestamp", -1)])
    if last:
        ts = last.get("timestamp")
        if isinstance(ts, datetime):
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            recent = (D.now() - ts) < timedelta(seconds=60)
            if recent and last.get("ip") == ip and last.get("pageVisited") == body.page:
                return {"success": True, "message": "Visitor session updated.", "tracked": D.serialize(last)}

    is_mobile = "Mobile" in user_agent or "Android" in user_agent or "iPhone" in user_agent
    doc = {
        "id": f"VIS-{str(int(D.now().timestamp() * 1000))[-4:]}",
        "ip": ip,
        "city": city,
        "country": country,
        "device": "Mobile Chrome (Android)" if is_mobile else "Desktop Chrome (Windows)",
        "pageVisited": body.page or "/",
        "userAgent": user_agent[:250],
        "timestamp": D.now(),
    }
    await D.visitorlogs.insert_one(dict(doc))
    return {"success": True, "tracked": D.serialize(doc)}


# --------------------------------------------------------------------------- #
# ORDERS (public create)
# --------------------------------------------------------------------------- #
@router.post("/orders", status_code=201)
async def create_order(body: OrderBody, request: Request):
    import random

    doc = {
        "id": f"ORD-{random.randint(10000, 99999)}",
        "type": body.type or "BUY",
        "clientName": body.clientName or "Pelanggan OTC",
        "phone": body.phone or "-",
        "amountUsdt": float(body.amountUsdt or 0),
        "amountIdr": float(body.amountIdr or 0),
        "paymentMethod": body.paymentMethod or "BCA Instant",
        "walletAddress": body.walletAddress or "-",
        "network": body.network or "TRC-20",
        "status": "PENDING",
        "createdAt": D.now(),
    }
    await D.orders.insert_one(dict(doc))
    await D.log_activity(
        "UPDATE", "INFO", "ORDER_ENGINE", "Order OTC Baru Masuk",
        f"Order {doc['id']} sebesar {doc['amountUsdt']} USDT dibuat dari landing page",
        {"orderId": doc["id"]}, client_ip(request), "GUEST",
    )
    return {"success": True, "order": D.serialize(doc)}


# --------------------------------------------------------------------------- #
# POPUPS (public)
# --------------------------------------------------------------------------- #
@router.get("/popups")
async def public_popups():
    items = await D.popups.find({"isActive": True}).sort("updatedAt", -1).to_list(length=50)
    return {"success": True, "popups": D.serialize(items)}


@router.post("/popups/{popup_id}/view")
async def popup_view(popup_id: str):
    await D.popups.update_one({"id": popup_id}, {"$inc": {"viewsCount": 1}})
    return {"success": True}


@router.post("/popups/{popup_id}/click")
async def popup_click(popup_id: str):
    await D.popups.update_one({"id": popup_id}, {"$inc": {"clicksCount": 1}})
    return {"success": True}


# --------------------------------------------------------------------------- #
# TESTIMONIALS (public)
# --------------------------------------------------------------------------- #
@router.get("/testimonials")
async def public_testimonials():
    items = await D.testimonials.find({"isActive": True}).sort("createdAt", -1).to_list(length=500)
    data = D.serialize(items)
    row1 = [t for t in data if t.get("row") == 1]
    row2 = [t for t in data if t.get("row") == 2]
    if not row1 or not row2:
        half = (len(data) + 1) // 2
        row1 = row1 or data[:half]
        row2 = row2 or data[half:]
    return {"success": True, "testimonials": data, "row1": row1, "row2": row2, "total": len(data)}


# --------------------------------------------------------------------------- #
# ASSET SERVING (images stored inside MongoDB)
# --------------------------------------------------------------------------- #
@router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    doc = await D.galleryassets.find_one({"filename": filename})
    if not doc or not doc.get("data"):
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    raw = doc["data"]
    if isinstance(raw, str):
        raw = base64.b64decode(raw)
    return Response(
        content=bytes(raw),
        media_type=doc.get("contentType", "image/png"),
        headers={"Cache-Control": "public, max-age=31536000"},
    )


@router.get("/health")
async def health():
    try:
        await D.db.command("ping")
        return {"status": "ok", "database": D.DB_NAME, "connected": True, "time": D.iso(D.now())}
    except Exception as exc:
        return {"status": "degraded", "database": D.DB_NAME, "connected": False, "error": str(exc)}


@router.get("/")
async def root():
    return {"message": "BERKAH USDT API aktif", "database": D.DB_NAME}
