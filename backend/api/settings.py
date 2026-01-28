from fastapi import APIRouter, HTTPException, UploadFile, File
from backend.services.config_service import ConfigService, SettingsModel
import shutil
import os

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

@router.post("/cookies")
async def upload_cookies(file: UploadFile = File(...)):
    """
    Upload cookies.txt file to the configured path
    """
    try:
        settings = ConfigService.load_settings()
        path = settings.cookies_path
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"status": "success", "message": "Cookies uploaded successfully", "path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save cookies: {str(e)}")

@router.get("/cookies")
def get_cookies():
    """
    Get cookies file content
    """
    settings = ConfigService.load_settings()
    path = settings.cookies_path
    
    if not os.path.exists(path):
        return {"content": ""}
        
    try:
        with open(path, 'r') as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read cookies: {str(e)}")

@router.post("/cookies/validate")
def validate_cookies():
    """
    Validate the cookies file
    """
    settings = ConfigService.load_settings()
    path = settings.cookies_path
    
    if not os.path.exists(path):
         raise HTTPException(status_code=404, detail=f"Cookies file not found at {path}")
         
    try:
        with open(path, 'r') as f:
            content = f.read()
            
        if len(content.strip()) == 0:
            raise HTTPException(status_code=400, detail="Cookies file is empty")
            
        return {"status": "valid", "message": "Cookies file is accessible"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
