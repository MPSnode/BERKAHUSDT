"""Authentication helpers: password hashing, JWT tokens, TOTP (Google Authenticator), IP whitelist."""
import base64
import io
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
import jwt
import pyotp
import qrcode
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

JWT_SECRET = os.environ.get("JWT_SECRET", "berkahusdt_secret_key_2026")
JWT_ALGORITHM = "HS256"
ISSUER_NAME = "BERKAH USDT Admin"

bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(raw: str) -> str:
    return bcrypt.hashpw(raw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(raw: str, hashed: str) -> bool:
    if not raw or not hashed:
        return False
    try:
        return bcrypt.checkpw(raw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def verify_totp(secret: str, code: str) -> bool:
    if not secret or not code:
        return False
    try:
        return pyotp.TOTP(secret).verify(str(code).strip(), valid_window=1)
    except Exception:
        return False


def totp_provisioning_uri(secret: str, username: str) -> str:
    return pyotp.TOTP(secret).provisioning_uri(name=username or "admin", issuer_name=ISSUER_NAME)


def totp_qr_data_uri(secret: str, username: str) -> str:
    uri = totp_provisioning_uri(secret, username)
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def hours_from_timeout(text: Optional[str]) -> int:
    if not text:
        return 24
    digits = "".join(ch for ch in str(text) if ch.isdigit())
    try:
        value = int(digits) if digits else 24
    except ValueError:
        value = 24
    lowered = str(text).lower()
    if "minute" in lowered or "menit" in lowered:
        return max(1, value // 60) or 1
    if "day" in lowered or "hari" in lowered:
        return value * 24
    return max(1, value)


def create_token(username: str, hours: int = 24) -> str:
    payload = {
        "username": username,
        "role": "SUPER_ADMIN",
        "exp": datetime.now(timezone.utc) + timedelta(hours=hours),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


async def current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized access")
    try:
        return decode_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or expired token")
    except Exception:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or expired token")


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real = request.headers.get("x-real-ip")
    if real:
        return real.strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"


def ip_allowed(whitelist: str, ip: str) -> bool:
    """Empty whitelist = allow all. Supports comma/newline separated exact IPs or prefixes ending with *."""
    if not whitelist or not whitelist.strip():
        return True
    entries = [e.strip() for e in whitelist.replace("\n", ",").split(",") if e.strip()]
    if not entries:
        return True
    for entry in entries:
        if entry.endswith("*") and ip.startswith(entry[:-1]):
            return True
        if entry == ip:
            return True
    return False
