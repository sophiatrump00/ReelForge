import sys
import os
import json
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to sys.path if running from root
if os.getcwd() not in sys.path:
    sys.path.append(os.getcwd())

from backend.core.config import settings as app_settings, get_data_dir
from backend.models.settings import Settings, Keyword

# Use sync engine for script
engine = create_engine(app_settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_data():
    db = SessionLocal()
    try:
        # 1. Migrate Settings
        if db.query(Settings).first() is None:
            logger.info("Migrating settings.json to DB...")
            data_dir = get_data_dir()
            json_path = data_dir / "settings.json"
            
            if json_path.exists():
                with open(json_path, 'r') as f:
                    data = json.load(f)
                
                # Check for existing config (if any)
                # If settings table is empty, we create the first row
                settings_obj = Settings(
                    id=1,
                    vendor=data.get('vendor', 'custom'),
                    api_base=data.get('api_base', 'https://api.openai.com/v1'),
                    api_key=data.get('api_key', ''),
                    vl_model=data.get('vl_model', 'gpt-4-vision-preview'),
                    cookies_path=data.get('cookies_path', '/app/data/cookies.txt'),
                    extra=data  # Store original JSON just in case
                )
                db.add(settings_obj)
                db.commit()
                logger.info("Settings migrated.")
            else:
                logger.info("No settings.json found, creating default.")
                db.add(Settings(id=1))
                db.commit()
        
        # 2. Migrate Keywords
        if db.query(Keyword).count() == 0:
            logger.info("Migrating keywords.json to DB...")
            data_dir = get_data_dir()
            json_path = data_dir / "keywords.json"
            
            if json_path.exists():
                with open(json_path, 'r') as f:
                    data = json.load(f)
                
                count = 0
                for k in data.get('positive', []):
                     if not db.query(Keyword).filter_by(text=k, category='positive').first():
                        db.add(Keyword(text=k, category='positive'))
                        count += 1
                
                for k in data.get('negative', []):
                     if not db.query(Keyword).filter_by(text=k, category='negative').first():
                        db.add(Keyword(text=k, category='negative'))
                        count += 1
                        
                db.commit()
                logger.info(f"{count} Keywords migrated.")
            else:
                logger.info("No keywords.json found, skipping.")
                
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_data()
