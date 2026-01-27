from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.db.session import get_db
from backend.services.material_service import MaterialService
from backend.services.material_service import MaterialService
from pydantic import BaseModel
import os
from typing import List, Optional

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

@router.get("/{material_id}", response_model=MaterialOut)
def read_material(material_id: int, db: Session = Depends(get_db)):
    service = MaterialService(db)
    item = service.get_material(material_id)
    if not item:
        raise HTTPException(status_code=404, detail="Material not found")
    return item

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
