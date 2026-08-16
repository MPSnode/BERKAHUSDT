"""BERKAH USDT — FastAPI backend (USDT <-> IDR OTC exchange landing page + admin panel)."""
import logging
import os

from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import db as D
import routes_admin
import routes_public
import routes_system

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("berkahusdt")

app = FastAPI(title="BERKAH USDT API", version="2.0.0")

api_router = APIRouter(prefix="/api")
api_router.include_router(routes_public.router, tags=["public"])
api_router.include_router(routes_admin.router, tags=["admin"])
api_router.include_router(routes_system.router, tags=["system"])
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s: %s", request.url.path, exc)
    try:
        await D.log_activity(
            "ERROR", "ERROR", "API", "Unhandled API Error",
            f"{request.method} {request.url.path} gagal: {exc}", None,
        )
    except Exception:
        pass
    return JSONResponse(status_code=500, content={"success": False, "detail": str(exc)})


@app.on_event("startup")
async def startup():
    try:
        await D.ensure_seed()
        logger.info("MongoDB '%s' siap & data awal tersedia.", D.DB_NAME)
    except Exception as exc:
        logger.error("Gagal melakukan seeding database: %s", exc)


@app.on_event("shutdown")
async def shutdown():
    D.client.close()
