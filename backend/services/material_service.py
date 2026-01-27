from sqlalchemy.orm import Session
from backend.models.material import Material, MaterialStatus
from typing import List, Optional

class MaterialService:
    def __init__(self, db: Session):
        self.db = db

    def create_material(self, filename: str, filepath: str, source: str = "upload", **kwargs) -> Material:
        db_obj = Material(filename=filename, filepath=filepath, source=source, **kwargs)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_material(self, material_id: int) -> Optional[Material]:
        return self.db.query(Material).filter(Material.id == material_id).first()

    def get_materials(self, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Material]:
        query = self.db.query(Material)
        if status:
            query = query.filter(Material.status == status)
        return query.offset(skip).limit(limit).all()

    def update_status(self, material_id: int, status: MaterialStatus) -> Optional[Material]:
        obj = self.get_material(material_id)
        if obj:
            obj.status = status
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def update_ai_analysis(self, material_id: int, score: float, tags: List[str], summary: str):
        obj = self.get_material(material_id)
        if obj:
            obj.ai_score = score
            obj.ai_tags = tags
            obj.ai_summary = summary
            self.db.commit()
            self.db.refresh(obj)
        return obj
