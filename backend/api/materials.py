from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.db.session import get_db
from backend.services.material_service import MaterialService
from backend.services.archive_service import ArchiveService
from pydantic import BaseModel
import os
from typing import List, Optional
from backend.workers.process_flow import video_processing_flow
from fastapi import BackgroundTasks

router = APIRouter()

# Simple Schema (in real app, put in schemas/)
class MaterialOut(BaseModel):
    id: int
    filename: str
    status: str
    ai_score: Optional[float] = None
    
    class Config:
        from_attributes = True

class FileNode(BaseModel):
    name: str
    type: str  # 'folder' or 'file'
    path: str
    size: Optional[int] = 0
    children: List['FileNode'] = []

class ProcessRequest(BaseModel):
    path: str
    ad_goal: Optional[str] = None

def scan_directory(path: str, root_path: str) -> List[FileNode]:
    nodes = []
    try:
        if not os.path.exists(path):
            return []
            
        with os.scandir(path) as entries:
            for entry in entries:
                if entry.name.startswith('.'):
                    continue
                    
                relative_path = os.path.relpath(entry.path, root_path)
                
                if entry.is_dir():
                    node = FileNode(
                        name=entry.name,
                        type='folder',
                        path=relative_path,
                        children=scan_directory(entry.path, root_path)
                    )
                    nodes.append(node)
                else:
                    node = FileNode(
                        name=entry.name,
                        type='file',
                        path=relative_path,
                        size=entry.stat().st_size
                    )
                    nodes.append(node)
                    
        # Sort: folders first, then files
        nodes.sort(key=lambda x: (x.type != 'folder', x.name))
    except Exception as e:
        print(f"Error scanning {path}: {e}")
        
    return nodes

@router.get("/", response_model=List[MaterialOut])
def read_materials(skip: int = 0, limit: int = 100, status: Optional[str] = None, db: Session = Depends(get_db)):
    service = MaterialService(db)
    return service.get_materials(skip=skip, limit=limit, status=status)



@router.get("/files/scan", response_model=FileNode)
def scan_files():
    """
    Scan the /app/data directory and return file tree
    """
    data_root = "/app/data"
    
    # Ensure directories exist
    for subdir in ["raw", "processed", "output", "temp"]:
        os.makedirs(os.path.join(data_root, subdir), exist_ok=True)
        
    children = scan_directory(data_root, data_root)
    
    return FileNode(
        name="data",
        type="folder",
        path="",
        children=children
    )


# ============ Download Archive Endpoints ============

@router.get("/archive")
def get_archive_entries(skip: int = 0, limit: int = 100, search: Optional[str] = None):
    """Get download archive entries with pagination and search."""
    return ArchiveService.get_entries(skip=skip, limit=limit, search=search)


@router.get("/archive/status")
def get_archive_status():
    """Get download archive status."""
    return ArchiveService.get_status()


@router.post("/archive/sync")
def sync_archive_from_file():
    """Sync entries from archive.txt file to database."""
    return ArchiveService.sync_from_file()


@router.delete("/archive/{entry_id}")
def delete_archive_entry(entry_id: int):
    """Delete an archive entry."""
    result = ArchiveService.delete_entry(entry_id)
    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Entry not found")
    return result


@router.delete("/archive")
def clear_archive():
    """Clear all archive entries."""
    return ArchiveService.clear_all()


@router.get("/archive/export")
def export_archive():
    """Export archive to file and return it."""
    path = ArchiveService.export_to_file()
    if os.path.exists(path):
        return FileResponse(path, filename="archive.txt", media_type="text/plain")
    return {"status": "error", "message": "File not found"}

@router.get("/{material_id}", response_model=MaterialOut)
def read_material(material_id: int, db: Session = Depends(get_db)):
    service = MaterialService(db)
    item = service.get_material(material_id)
    if not item:
        raise HTTPException(status_code=404, detail="Material not found")
    return item

@router.post("/process")
def process_video(request: ProcessRequest, background_tasks: BackgroundTasks):
    """
    Trigger video processing pipeline in background
    """
    # Check if file exists
    full_path = os.path.join("/app/data", request.path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    output_dir = os.path.join("/app/data/processed", os.path.splitext(os.path.basename(request.path))[0])
    os.makedirs(output_dir, exist_ok=True)
    
    # Run in background
    background_tasks.add_task(video_processing_flow, full_path, output_dir, request.ad_goal)
    
    return {"status": "processing_started", "file": request.path}
