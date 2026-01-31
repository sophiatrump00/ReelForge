import logging
import os
from datetime import datetime
from typing import Optional, List

from backend.db.session import SessionLocal
from backend.models.batch_links import BatchLinks

logger = logging.getLogger(__name__)

# Path to the links.txt file that yt-dlp will use
LINKS_FILE_PATH = "/app/data/links.txt"


class BatchService:
    """Service for managing batch download links."""

    @staticmethod
    def get_content() -> dict:
        """Get batch links content from database."""
        db = SessionLocal()
        try:
            record = db.query(BatchLinks).filter(BatchLinks.id == 1).first()
            if not record:
                return {
                    "content": "",
                    "updated_at": None,
                    "count": 0
                }
            
            lines = [l for l in record.content.strip().split('\n') if l.strip() and not l.strip().startswith('#')]
            return {
                "content": record.content,
                "updated_at": record.updated_at.isoformat() if record.updated_at else None,
                "count": len(lines)
            }
        except Exception as e:
            logger.error(f"Failed to get batch content: {e}")
            return {"content": "", "updated_at": None, "count": 0}
        finally:
            db.close()

    @staticmethod
    def save_content(content: str) -> dict:
        """Save batch links content to database and sync to file."""
        db = SessionLocal()
        try:
            record = db.query(BatchLinks).filter(BatchLinks.id == 1).first()
            if not record:
                record = BatchLinks(id=1, content=content)
                db.add(record)
            else:
                record.content = content
                record.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(record)
            
            # Sync to file for yt-dlp to use
            BatchService._sync_to_file(content)
            
            lines = [l for l in content.strip().split('\n') if l.strip() and not l.strip().startswith('#')]
            return {
                "status": "saved",
                "updated_at": record.updated_at.isoformat() if record.updated_at else None,
                "count": len(lines)
            }
        except Exception as e:
            logger.error(f"Failed to save batch content: {e}")
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    def parse_links(content: str) -> List[str]:
        """Parse content and extract valid URLs."""
        lines = content.strip().split('\n')
        urls = []
        for line in lines:
            line = line.strip()
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            # Basic URL validation
            if line.startswith('http://') or line.startswith('https://'):
                urls.append(line)
        return urls

    @staticmethod
    def get_status() -> dict:
        """Get batch links status (count, last updated, file exists)."""
        data = BatchService.get_content()
        file_exists = os.path.exists(LINKS_FILE_PATH)
        return {
            "count": data["count"],
            "updated_at": data["updated_at"],
            "file_exists": file_exists
        }

    @staticmethod
    def _sync_to_file(content: str) -> None:
        """Sync content to the links.txt file."""
        try:
            os.makedirs(os.path.dirname(LINKS_FILE_PATH), exist_ok=True)
            with open(LINKS_FILE_PATH, 'w') as f:
                f.write(content)
            logger.info(f"Synced batch links to {LINKS_FILE_PATH}")
        except Exception as e:
            logger.error(f"Failed to sync to file: {e}")
