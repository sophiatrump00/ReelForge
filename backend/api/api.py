from fastapi import APIRouter
from backend.api import download, materials, ai, settings, keywords, reports, system

api_router = APIRouter()
api_router.include_router(download.router, prefix="/download", tags=["download"])
api_router.include_router(materials.router, prefix="/materials", tags=["materials"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(keywords.router, prefix="/keywords", tags=["keywords"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
