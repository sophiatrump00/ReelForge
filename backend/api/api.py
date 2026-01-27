from fastapi import APIRouter
from backend.api import download, materials

api_router = APIRouter()
api_router.include_router(download.router, prefix="/download", tags=["download"])
api_router.include_router(materials.router, prefix="/materials", tags=["materials"])
