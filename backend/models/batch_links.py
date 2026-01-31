from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func
from backend.db.session import Base


class BatchLinks(Base):
    """
    Storage for batch download links (links.txt content).
    Persisted to database to survive refreshes.
    """
    __tablename__ = "batch_links"

    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
