"""MongoDB (Motor) connection, collections, serialization helpers and seeding for BERKAHUSDT."""
import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logger = logging.getLogger("berkahusdt.db")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ.get("DB_NAME", "BERKAHUSDT")

client = AsyncIOMotorClient(MONGO_URL, uuidRepresentation="standard")
db = client[DB_NAME]

# Collection handles (1:1 with previous mongoose models)
adminusers = db.adminusers
logoconfigs = db.logoconfigs
logologs = db.logologs
rates = db.rates
ratelogs = db.ratelogs
orders = db.orders
visitorlogs = db.visitorlogs
securityconfigs = db.securityconfigs
securitylogs = db.securitylogs
systemlogs = db.systemlogs
popups = db.popups
testimonials = db.testimonials
# New collections
galleryassets = db.galleryassets
sitesettings = db.sitesettings
chartpoints = db.chartpoints


def now() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    if isinstance(dt, str):
        return dt
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def serialize(doc: Any) -> Any:
    """Recursively convert Mongo documents into JSON-serializable structures."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize(d) for d in doc]
    if isinstance(doc, dict):
        out: Dict[str, Any] = {}
        for k, v in doc.items():
            if k == "_id":
                out["_id"] = str(v)
                continue
            out[k] = serialize(v)
        return out
    if isinstance(doc, datetime):
        return iso(doc)
    if isinstance(doc, bytes):
        return None
    if isinstance(doc, uuid.UUID):
        return str(doc)
    try:
        from bson import ObjectId

        if isinstance(doc, ObjectId):
            return str(doc)
    except Exception:  # pragma: no cover
        pass
    return doc


async def log_activity(
    category: str,
    severity: str,
    source: str,
    title: str,
    message: str,
    details: Any = None,
    ip: str = "127.0.0.1",
    admin_user: str = "admin",
):
    import json

    detail_str = ""
    if details is not None:
        detail_str = json.dumps(details, default=str) if isinstance(details, (dict, list)) else str(details)
    doc = {
        "id": f"LOG-{str(int(now().timestamp() * 1000))[-6:]}",
        "category": category,
        "severity": severity,
        "source": source,
        "title": title,
        "message": message,
        "details": detail_str,
        "ip": ip or "127.0.0.1",
        "adminUser": admin_user or "admin",
        "timestamp": now(),
    }
    try:
        await systemlogs.insert_one(dict(doc))
    except Exception as exc:  # pragma: no cover
        logger.error("Failed writing system log: %s", exc)


# --------------------------------------------------------------------------- #
# DEFAULTS / SEEDS
# --------------------------------------------------------------------------- #
DEFAULT_LOGOS = {
    "brandNavbar": {
        "name": "Logo Brand Navbar & Footer",
        "path": "/logo_berkah.jpg",
        "location": "Header Navbar & Footer Website",
    },
    "coinFront": {
        "name": "Logo Medallion Koin 3D Depan",
        "path": "/coin_front.png",
        "location": "Koin 3D Utama (Sisi Depan)",
    },
    "coinBack": {
        "name": "Logo Medallion Koin 3D Belakang",
        "path": "/coin_back.png",
        "location": "Koin 3D Utama (Sisi Belakang)",
    },
    "coinShib": {
        "name": "Logo Shiba Inu (SHIB)",
        "path": "/coin_shib.png",
        "location": "Orbiting Koin 3D Crypto (Shiba Inu)",
    },
    "favicon": {
        "name": "Favicon Browser Website",
        "path": "/favicon.svg",
        "location": "Tab Browser & Bookmark Icon",
    },
}

DEFAULT_RATES = {"buyRate": 18000, "sellRate": 17000, "minUsdt": 10}

DEFAULT_SECURITY = {
    "key": "global_security",
    "apiSecurity": {
        "rateLimitEnabled": True,
        "maxReqPerMin": 120,
        "corsAllowedOrigins": "*",
        "jwtExpiryDuration": "24 Hours",
        "nosqlSanitization": True,
        "payloadSizeLimitMb": 25,
    },
    "adminSecurity": {
        "google2faEnabled": False,
        "google2faSecret": "",
        "sessionTimeout": "24 Hours",
        "ipWhitelist": "",
        "failedAttemptsLockout": True,
        "maxFailedAttempts": 5,
    },
    "websiteSecurity": {
        "httpsEnforced": True,
        "clickjackingProtection": True,
        "mimeSniffProtection": True,
        "hstsEnabled": True,
        "xssFilterEnabled": True,
        "botScraperProtection": True,
        "cspPolicy": "default-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;",
    },
    "blockedIps": [],
}

DEFAULT_SOCIAL = {
    "whatsapp": "https://wa.me/6281234567890",
    "telegramChannel": "https://t.me/berkahusdt",
    "telegramAdmin1": "https://t.me/berkahusdt_admin1",
    "telegramAdmin2": "https://t.me/berkahusdt_admin2",
    "telegramAdmin1Label": "Admin 1 (Fast Response)",
    "telegramAdmin2Label": "Admin 2 (Backup Desk)",
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "tiktok": "",
    "youtube": "",
    "email": "support@berkahusdt.com",
    "phone": "+62 812-3456-7890",
    "address": "Jakarta, Indonesia",
    "operationalHours": "Setiap hari 08.00 - 23.00 WIB",
}

DEFAULT_CONTENT = {
    "brandName": "BERKAH USDT",
    "themeColor": "#10B981",
    "themeColorDark": "#059669",
    "logoUrl": "/logo_berkah.png",
    "logoLink": "/",
    "coinFrontUrl": "/coin_front.png",
    "coinBackUrl": "/coin_back.png",
    "heroBadge": "OTC DESK USDT TERPERCAYA INDONESIA",
    "heroTitle": "Jual & Beli USDT",
    "heroTitleAccent": "Rate Terbaik Indonesia",
    "heroSubtitle": "Moneychanger USDT legal, cepat, bebas slippage dengan jaminan aman 100%. Proses instan 1-3 menit langsung cair ke rekening Anda.",
    "heroCtaText": "Mulai Transaksi Sekarang",
    "calculatorTitle": "Kalkulator Transaksi USDT",
    "calculatorSubtitle": "Hitung otomatis nilai tukar USDT ke Rupiah dengan rate real-time hari ini",
    "chartTitle": "Grafik Pergerakan Rate USDT",
    "chartSubtitle": "Pantau naik-turun rate harga USDT/IDR yang kami perbarui setiap hari",
    "socialTitle": "Hubungi Kami",
    "socialSubtitle": "Tim OTC kami siap melayani transaksi Anda melalui kanal resmi berikut",
    "networkTitle": "Jaringan yang Didukung",
    "networkSubtitle": "Kami mendukung transfer & penerimaan USDT di berbagai jaringan blockchain populer",
    "footerTagline": "Platform OTC USDT terpercaya untuk transaksi cepat, aman, dan transparan.",
    "footerCopyright": "BERKAH USDT. Seluruh hak cipta dilindungi.",
}

DEFAULT_NETWORKS = {
    "freeFeeThresholdUsdt": 2000,
    "defaultNetwork": "TRC-20",
    "networks": [
        {"code": "TRC-20", "name": "Tron (TRC-20)", "feeUsdt": 1.0, "estimate": "1-3 menit", "isActive": True, "icon": "/coin_trx.png"},
        {"code": "BEP-20", "name": "BNB Smart Chain (BEP-20)", "feeUsdt": 0.8, "estimate": "1-3 menit", "isActive": True, "icon": "/coin_btc.png"},
        {"code": "ERC-20", "name": "Ethereum (ERC-20)", "feeUsdt": 5.0, "estimate": "3-10 menit", "isActive": True, "icon": "/coin_eth.png"},
        {"code": "POLYGON", "name": "Polygon (MATIC)", "feeUsdt": 0.5, "estimate": "1-2 menit", "isActive": True, "icon": "/coin_sol.png"},
        {"code": "SOLANA", "name": "Solana (SPL)", "feeUsdt": 0.6, "estimate": "1-2 menit", "isActive": True, "icon": "/coin_sol.png"},
        {"code": "ARBITRUM", "name": "Arbitrum One", "feeUsdt": 0.7, "estimate": "1-3 menit", "isActive": True, "icon": "/coin_eth.png"},
    ],
    "paymentMethods": [
        {"code": "BCA", "name": "Bank BCA", "type": "BANK", "account": "1234567890", "holder": "BERKAH USDT", "isActive": True},
        {"code": "MANDIRI", "name": "Bank Mandiri", "type": "BANK", "account": "1234567890", "holder": "BERKAH USDT", "isActive": True},
        {"code": "BRI", "name": "Bank BRI", "type": "BANK", "account": "1234567890", "holder": "BERKAH USDT", "isActive": True},
        {"code": "BNI", "name": "Bank BNI", "type": "BANK", "account": "1234567890", "holder": "BERKAH USDT", "isActive": True},
        {"code": "DANA", "name": "DANA", "type": "EWALLET", "account": "081234567890", "holder": "BERKAH USDT", "isActive": True},
        {"code": "OVO", "name": "OVO", "type": "EWALLET", "account": "081234567890", "holder": "BERKAH USDT", "isActive": True},
    ],
}

DEFAULT_CHART_SETTINGS = {
    "chartType": "area",
    "showBuy": True,
    "showSell": True,
    "autoAppendOnRateUpdate": True,
    "visiblePoints": 30,
}

DEFAULT_SEED_POPUPS = [
    {
        "id": "POP-001",
        "title": "🔥 PROMO RATE SPESIAL OTC BERKAH USDT",
        "subtitle": "Spread Terendah & Bebas Biaya Admin Terverifikasi",
        "description": "Nikmati layanan transaksi OTC USDT tercepat di Indonesia dengan jaminan likuiditas instan 1-3 menit langsung cair ke rekening Bank / E-Wallet Anda.",
        "imageUrl": "/logo_berkah.jpg",
        "imageWidth": "medium",
        "imageAspectRatio": "16/9",
        "badgeText": "PENGUMUMAN RESMI",
        "accentColor": "emerald",
        "buttonText": "🚀 Transaksi via WhatsApp",
        "buttonUrl": "https://wa.me/6281234567890?text=Halo%20Admin%20Berkah%20USDT,%20saya%20ingin%20transaksi%20OTC",
        "buttonTarget": "_blank",
        "isActive": True,
        "autoCloseSeconds": 0,
        "showOncePerSession": True,
        "viewsCount": 0,
        "clicksCount": 0,
    }
]

_TESTI_ROW1 = [
    ("TESTI-101", "Penukaran USDT", "Buyer OTC Jakarta", "-2.500 USDT"),
    ("TESTI-102", "Pembelian USDT", "Buyer OTC Surabaya", "-6.200 USDT"),
    ("TESTI-103", "Transaksi OTC Instan", "Buyer OTC Medan", "-4.000 USDT"),
    ("TESTI-104", "Transfer Likuiditas", "Buyer OTC Bali", "-3.248,97 USDT"),
    ("TESTI-105", "Penukaran Kilat", "Buyer OTC Bandung", "-770 USDT"),
    ("TESTI-106", "Beli USDT OTC", "Buyer OTC Semarang", "-1.100 USDT"),
    ("TESTI-107", "OTC Volume Besar", "Buyer VIP Trader", "-15.000 USDT"),
]
_TESTI_ROW2 = [
    ("TESTI-201", "OTC VIP Liquidity", "Buyer OTC Makassar", "-14.700 USDT"),
    ("TESTI-202", "Transaksi OTC USDT", "Buyer VIP Whales", "-20.000 USDT"),
    ("TESTI-203", "Penarikan Dana OTC", "Buyer OTC Eksekutif", "-37.056,92 USDT"),
    ("TESTI-204", "Pembelian USDT", "Buyer OTC Yogyakarta", "-10.000 USDT"),
    ("TESTI-205", "OTC Fast Settlement", "Buyer OTC Palembang", "-8.904,72 USDT"),
    ("TESTI-206", "Penukaran Instan", "Buyer OTC Batam", "-14.247,78 USDT"),
    ("TESTI-207", "Pencairan OTC USDT", "Buyer OTC Samarinda", "-9.847,5 USDT"),
]


def default_seed_testimonials() -> List[Dict[str, Any]]:
    items = []
    base = now()
    for idx, (tid, title, client_name, amount) in enumerate(_TESTI_ROW1 + _TESTI_ROW2):
        row = 1 if idx < len(_TESTI_ROW1) else 2
        items.append(
            {
                "id": tid,
                "title": title,
                "clientName": client_name,
                "amount": amount,
                "status": "Selesai" if row == 1 else "Completed",
                "imageUrl": "",
                "row": row,
                "rating": 5,
                "network": "TRC-20",
                "badge": "VERIFIED USDT",
                "timestampText": "Selesai" if row == 1 else "Completed",
                "isActive": True,
                "createdAt": base - timedelta(minutes=idx * 10),
            }
        )
    return items


DEFAULT_SEED_LOGS = [
    {
        "id": "LOG-88001",
        "category": "SYSTEM",
        "severity": "SUCCESS",
        "source": "SERVER",
        "title": "FastAPI Server Running",
        "message": "Backend BERKAH USDT aktif dan mendengarkan pada 0.0.0.0:8001",
        "details": "Environment: production, Port: 8001",
        "ip": "127.0.0.1",
        "adminUser": "SYSTEM",
    },
    {
        "id": "LOG-88002",
        "category": "DATABASE",
        "severity": "SUCCESS",
        "source": "MONGODB",
        "title": "MongoDB Connected",
        "message": f"Koneksi ke database {DB_NAME} berhasil dibuka",
        "details": "Driver: Motor (AsyncIO)",
        "ip": "127.0.0.1",
        "adminUser": "SYSTEM",
    },
]


async def ensure_seed():
    """Idempotent seeding of all base documents."""
    from auth import hash_password, generate_totp_secret

    if await adminusers.count_documents({}) == 0:
        await adminusers.insert_one(
            {
                "username": "admin",
                "passwordHash": hash_password("admin"),
                "google2faEnabled": False,
                "google2faSecret": generate_totp_secret(),
                "sessionTimeout": "24 Hours",
                "ipWhitelist": "",
                "loginAlerts": True,
                "createdAt": now(),
            }
        )

    if await logoconfigs.count_documents({"key": "global_logos"}) == 0:
        await logoconfigs.insert_one({"key": "global_logos", "data": DEFAULT_LOGOS})

    if await rates.count_documents({}) == 0:
        await rates.insert_one({**DEFAULT_RATES, "updatedAt": now()})

    if await securityconfigs.count_documents({"key": "global_security"}) == 0:
        cfg = {k: (dict(v) if isinstance(v, dict) else v) for k, v in DEFAULT_SECURITY.items()}
        cfg["updatedAt"] = now()
        await securityconfigs.insert_one(cfg)

    if await systemlogs.count_documents({}) == 0:
        docs = []
        for i, item in enumerate(DEFAULT_SEED_LOGS):
            docs.append({**item, "timestamp": now() - timedelta(minutes=10 * (i + 1))})
        await systemlogs.insert_many(docs)

    if await popups.count_documents({}) == 0:
        docs = [{**p, "createdAt": now(), "updatedAt": now()} for p in DEFAULT_SEED_POPUPS]
        await popups.insert_many(docs)

    if await testimonials.count_documents({}) == 0:
        await testimonials.insert_many(default_seed_testimonials())

    # Site settings singletons
    for key, data in (
        ("social", DEFAULT_SOCIAL),
        ("content", DEFAULT_CONTENT),
        ("networks", DEFAULT_NETWORKS),
        ("chart", DEFAULT_CHART_SETTINGS),
    ):
        if await sitesettings.count_documents({"key": key}) == 0:
            await sitesettings.insert_one({"key": key, "data": data, "updatedAt": now()})

    # Seed a starter rate history so the landing chart is never empty
    if await chartpoints.count_documents({}) == 0:
        rate_doc = await rates.find_one({}) or DEFAULT_RATES
        buy = float(rate_doc.get("buyRate", 18000))
        sell = float(rate_doc.get("sellRate", 17000))
        docs = []
        for i in range(13, -1, -1):
            drift = (13 - i) * 12
            docs.append(
                {
                    "id": f"CHART-{i:03d}",
                    "label": (now() - timedelta(days=i)).strftime("%d %b"),
                    "buyRate": round(buy - 150 + drift, 2),
                    "sellRate": round(sell - 150 + drift, 2),
                    "timestamp": now() - timedelta(days=i),
                    "source": "SEED",
                }
            )
        await chartpoints.insert_many(docs)


async def get_setting(key: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
    doc = await sitesettings.find_one({"key": key})
    if not doc or not isinstance(doc.get("data"), dict):
        return dict(fallback)
    merged = dict(fallback)
    merged.update(doc["data"])
    return merged


async def save_setting(key: str, data: Dict[str, Any]) -> Dict[str, Any]:
    await sitesettings.update_one(
        {"key": key}, {"$set": {"data": data, "updatedAt": now()}}, upsert=True
    )
    return data
