import logging
import os
import re
from datetime import datetime
from typing import Optional, List, Dict

from backend.db.session import SessionLocal
from backend.models.download_archive import DownloadArchive

logger = logging.getLogger(__name__)

# Path to the archive.txt file that yt-dlp uses
ARCHIVE_FILE_PATH = "/app/data/archive.txt"


class ArchiveService:
    """Service for managing download archive (tracks downloaded videos)."""

    @staticmethod
    def get_entries(skip: int = 0, limit: int = 100, search: Optional[str] = None) -> dict:
        """Get archive entries from database with pagination and search."""
        db = SessionLocal()
        try:
            query = db.query(DownloadArchive)
            
            if search:
                search_pattern = f"%{search}%"
                query = query.filter(
                    (DownloadArchive.video_id.ilike(search_pattern)) |
                    (DownloadArchive.title.ilike(search_pattern)) |
                    (DownloadArchive.uploader.ilike(search_pattern))
                )
            
            total = query.count()
            entries = query.order_by(DownloadArchive.downloaded_at.desc()).offset(skip).limit(limit).all()
            
            return {
                "entries": [
                    {
                        "id": e.id,
                        "video_id": e.video_id,
                        "platform": e.platform,
                        "title": e.title,
                        "uploader": e.uploader,
                        "downloaded_at": e.downloaded_at.isoformat() if e.downloaded_at else None
                    }
                    for e in entries
                ],
                "total": total,
                "skip": skip,
                "limit": limit
            }
        except Exception as e:
            logger.error(f"Failed to get archive entries: {e}")
            return {"entries": [], "total": 0, "skip": skip, "limit": limit}
        finally:
            db.close()

    @staticmethod
    def add_entry(video_id: str, platform: str = "unknown", title: Optional[str] = None, uploader: Optional[str] = None) -> dict:
        """Add a new entry to the archive."""
        db = SessionLocal()
        try:
            # Check if already exists
            existing = db.query(DownloadArchive).filter(DownloadArchive.video_id == video_id).first()
            if existing:
                return {"status": "exists", "id": existing.id}
            
            entry = DownloadArchive(
                video_id=video_id,
                platform=platform,
                title=title,
                uploader=uploader
            )
            db.add(entry)
            db.commit()
            db.refresh(entry)
            
            # Sync to file
            ArchiveService._sync_to_file()
            
            return {"status": "added", "id": entry.id}
        except Exception as e:
            logger.error(f"Failed to add archive entry: {e}")
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    def delete_entry(entry_id: int) -> dict:
        """Delete an archive entry."""
        db = SessionLocal()
        try:
            entry = db.query(DownloadArchive).filter(DownloadArchive.id == entry_id).first()
            if not entry:
                return {"status": "not_found"}
            
            db.delete(entry)
            db.commit()
            
            # Sync to file
            ArchiveService._sync_to_file()
            
            return {"status": "deleted"}
        except Exception as e:
            logger.error(f"Failed to delete archive entry: {e}")
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    def clear_all() -> dict:
        """Clear all archive entries."""
        db = SessionLocal()
        try:
            count = db.query(DownloadArchive).delete()
            db.commit()
            
            # Clear file
            if os.path.exists(ARCHIVE_FILE_PATH):
                os.remove(ARCHIVE_FILE_PATH)
            
            return {"status": "cleared", "count": count}
        except Exception as e:
            logger.error(f"Failed to clear archive: {e}")
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    def sync_from_file() -> dict:
        """Sync entries from the archive.txt file to database."""
        if not os.path.exists(ARCHIVE_FILE_PATH):
            return {"status": "file_not_found", "added": 0}
        
        db = SessionLocal()
        added_count = 0
        try:
            with open(ARCHIVE_FILE_PATH, 'r') as f:
                lines = f.readlines()
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # yt-dlp archive format: "platform video_id"
                parts = line.split(' ', 1)
                if len(parts) == 2:
                    platform, video_id = parts
                else:
                    platform, video_id = "unknown", parts[0]
                
                # Check if exists
                existing = db.query(DownloadArchive).filter(DownloadArchive.video_id == video_id).first()
                if not existing:
                    entry = DownloadArchive(video_id=video_id, platform=platform)
                    db.add(entry)
                    added_count += 1
            
            db.commit()
            return {"status": "synced", "added": added_count}
        except Exception as e:
            logger.error(f"Failed to sync from file: {e}")
            db.rollback()
            return {"status": "error", "error": str(e)}
        finally:
            db.close()

    @staticmethod
    def get_status() -> dict:
        """Get archive status."""
        db = SessionLocal()
        try:
            total = db.query(DownloadArchive).count()
            latest = db.query(DownloadArchive).order_by(DownloadArchive.downloaded_at.desc()).first()
            file_exists = os.path.exists(ARCHIVE_FILE_PATH)
            
            return {
                "total": total,
                "last_downloaded_at": latest.downloaded_at.isoformat() if latest and latest.downloaded_at else None,
                "file_exists": file_exists
            }
        except Exception as e:
            logger.error(f"Failed to get archive status: {e}")
            return {"total": 0, "last_downloaded_at": None, "file_exists": False}
        finally:
            db.close()

    @staticmethod
    def _sync_to_file() -> None:
        """Sync database entries to archive.txt file."""
        db = SessionLocal()
        try:
            entries = db.query(DownloadArchive).all()
            os.makedirs(os.path.dirname(ARCHIVE_FILE_PATH), exist_ok=True)
            with open(ARCHIVE_FILE_PATH, 'w') as f:
                for entry in entries:
                    f.write(f"{entry.platform} {entry.video_id}\n")
            logger.info(f"Synced {len(entries)} entries to {ARCHIVE_FILE_PATH}")
        except Exception as e:
            logger.error(f"Failed to sync to file: {e}")
        finally:
            db.close()

    @staticmethod
    def export_to_file() -> str:
        """Export archive to file and return path."""
        ArchiveService._sync_to_file()
        return ARCHIVE_FILE_PATH
