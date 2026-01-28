from sqlalchemy import Column, Integer, String, Text, Boolean, JSON, DateTime
from sqlalchemy.sql import func
from backend.db.session import Base

class Settings(Base):
    """
    Key-Value storage for application settings.
    To allow simple "load all", we can store everything in one row with ID=1, 
    OR store as individual keys. 
    A single JSON row is easier to migrate from current structure.
    """
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True)
    vendor = Column(String, default="custom")
    api_base = Column(String, default="https://api.openai.com/v1")
    api_key = Column(String, default="")
    vl_model = Column(String, default="gpt-4-vision-preview")
    cookies_path = Column(String, default="/app/data/cookies.txt")
    
    # We can add a JSON column for future flexibility
    extra = Column(JSON, nullable=True)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class Keyword(Base):
    """
    Keywords for filtering.
    """
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, index=True, unique=True)
    category = Column(String, index=True) # "positive", "negative", or custom category
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
