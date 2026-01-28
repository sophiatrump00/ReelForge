from fastapi import APIRouter, HTTPException, BackgroundTasks
from backend.services.config_service import ConfigService
from backend.services.storage_monitor import StorageMonitor
from backend.core.config import get_data_dir
from pydantic import BaseModel
import os
import shutil
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class CleanupRequest(BaseModel):
    target: str = "temp" # temp, raw, output, all

@router.get("/status")
def get_system_status():
    settings = ConfigService.load_settings()
    
    # Storage Status
    storage_monitor = StorageMonitor()
    try:
        disk_usage = storage_monitor.check_usage()
    except:
        disk_usage = {"status": "unknown"}
    
    # Check paths
    data_dir = str(get_data_dir()) 
    
    def check_path(p):
        return {
            "path": p,
            "exists": os.path.exists(p),
            "writable": os.access(p, os.W_OK) if os.path.exists(p) else False
        }

    paths = {
        "root": check_path(data_dir),
        "raw": check_path(os.path.join(data_dir, "raw")),
        "output": check_path(os.path.join(data_dir, "output")),
        "temp": check_path(os.path.join(data_dir, "temp")),
        "processed": check_path(os.path.join(data_dir, "processed"))
    }
    
    # Cookies Status
    cookies_path = settings.cookies_path
    cookies_status = {
        "path": cookies_path,
        "exists": os.path.exists(cookies_path),
        "valid": False,
        "size_bytes": 0
    }
    
    if cookies_status["exists"]:
        try:
             size = os.path.getsize(cookies_path)
             cookies_status["size_bytes"] = size
             with open(cookies_path, 'r') as f:
                 content = f.read()
                 if len(content.strip()) > 0:
                     cookies_status["valid"] = True
        except:
            pass
            
    return {
        "storage": {
            "disk": disk_usage,
            "paths": paths
        },
        "cookies": cookies_status
    }

@router.post("/cleanup")
def cleanup_system(request: CleanupRequest, background_tasks: BackgroundTasks):
    """
    Clean up storage directories.
    """
    data_dir = str(get_data_dir())
    
    targets = {
        "temp": os.path.join(data_dir, "temp"),
        "raw": os.path.join(data_dir, "raw"),
        "output": os.path.join(data_dir, "output"),
    }
    
    if request.target == "all":
        paths_to_clean = list(targets.values())
    elif request.target in targets:
        paths_to_clean = [targets[request.target]]
    else:
        raise HTTPException(status_code=400, detail="Invalid cleanup target")
        
    def _do_cleanup(paths):
        for p in paths:
            if os.path.exists(p):
                logger.info(f"Cleaning directory: {p}")
                try:
                    for item in os.listdir(p):
                        item_path = os.path.join(p, item)
                        # Skip special files
                        if item == ".gitkeep": continue
                        
                        if os.path.isfile(item_path) or os.path.islink(item_path):
                            os.unlink(item_path)
                        elif os.path.isdir(item_path):
                            shutil.rmtree(item_path)
                    logger.info(f"Cleaned directory: {p}")
                except Exception as e:
                    logger.error(f"Failed to clean {p}: {str(e)}")

    background_tasks.add_task(_do_cleanup, paths_to_clean)
    
    return {"status": "accepted", "message": f"Cleanup for {request.target} scheduled"}
