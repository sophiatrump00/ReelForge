import logging
from pydantic import BaseModel
from backend.db.session import SessionLocal
from backend.models.settings import Settings

logger = logging.getLogger(__name__)

class SettingsModel(BaseModel):
    vendor: str = "custom"
    api_base: str = "https://api.openai.com/v1"
    api_key: str = ""
    vl_model: str = "gpt-4-vision-preview"
    cookies_path: str = "/app/data/cookies.txt"
    proxy_url: str = ""  # Optional proxy for yt-dlp downloads

class ConfigService:
    @staticmethod
    def load_settings() -> SettingsModel:
        """Load settings from DB or return defaults."""
        db = SessionLocal()
        try:
            settings_db = db.query(Settings).filter(Settings.id == 1).first()
            if not settings_db:
                return SettingsModel()
            
            return SettingsModel(
                vendor=settings_db.vendor,
                api_base=settings_db.api_base,
                api_key=settings_db.api_key or "",
                vl_model=settings_db.vl_model,
                cookies_path=settings_db.cookies_path or "/app/data/cookies.txt",
                proxy_url=settings_db.extra.get("proxy_url", "") if settings_db.extra else ""
            )
        except Exception as e:
            logger.error(f"Failed to load settings from DB: {e}")
            return SettingsModel()
        finally:
            db.close()

    @staticmethod
    def save_settings(settings: SettingsModel) -> None:
        """Save settings to DB."""
        db = SessionLocal()
        try:
            db_obj = db.query(Settings).filter(Settings.id == 1).first()
            if not db_obj:
                db_obj = Settings(id=1)
                db.add(db_obj)
            
            db_obj.vendor = settings.vendor
            db_obj.api_base = settings.api_base
            db_obj.api_key = settings.api_key
            db_obj.vl_model = settings.vl_model
            db_obj.cookies_path = settings.cookies_path
            db_obj.extra = {"proxy_url": settings.proxy_url}
            
            db.commit()
            logger.info("Settings saved to DB.")
        except Exception as e:
            logger.error(f"Failed to save settings: {e}")
            db.rollback()
            raise e
        finally:
            db.close()
