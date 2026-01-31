from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from backend.db.session import Base


class DownloadArchive(Base):
    """
    Tracks downloaded videos to avoid re-downloading.
    Mirrors yt-dlp's --download-archive functionality.
    """
    __tablename__ = "download_archive"

    id = Column(Integer, primary_key=True)
    video_id = Column(String(128), unique=True, index=True, nullable=False)
    platform = Column(String(32), index=True, default="unknown")
    title = Column(String(512), nullable=True)
    uploader = Column(String(256), nullable=True)
    downloaded_at = Column(DateTime(timezone=True), server_default=func.now())
