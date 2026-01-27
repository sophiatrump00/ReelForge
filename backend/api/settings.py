from fastapi import APIRouter, HTTPException
from backend.services.config_service import ConfigService, SettingsModel

router = APIRouter()

@router.get("/", response_model=SettingsModel)
def get_settings():
    return ConfigService.load_settings()

@router.post("/", response_model=SettingsModel)
def save_settings(settings: SettingsModel):
    try:
        ConfigService.save_settings(settings)
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
