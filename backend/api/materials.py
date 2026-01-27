from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.db.session import get_db
from backend.services.material_service import MaterialService
from pydantic import BaseModel

router = APIRouter()

# Simple Schema (in real app, put in schemas/)
class MaterialOut(BaseModel):
    id: int
    filename: str
    status: str
    ai_score: Optional[float] = None
    
    class Config:
        from_attributes = True

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
