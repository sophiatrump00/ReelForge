from backend.db.session import Base
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, JSON
from sqlalchemy.sql import func
import enum

class MaterialStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    ARCHIVED = "archived"
    FAILED = "failed"

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filepath = Column(String)
    
    # Metadata
    source = Column(String, default="upload") # tiktok, local
    source_url = Column(String, nullable=True)
    creator_id = Column(String, nullable=True)
    
    duration = Column(Float, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    
    # AI Analysis
    ai_score = Column(Float, nullable=True)
    ai_tags = Column(JSON, nullable=True) # List of tags
    ai_summary = Column(String, nullable=True)
    
    status = Column(Enum(MaterialStatus), default=MaterialStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
