import json
import os
import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)

CONFIG_PATH = "/app/data/config/settings.json"

class SettingsModel(BaseModel):
    vendor: str = "custom"
    api_base: str = "https://api.openai.com/v1"
    api_key: str = ""
    vl_model: str = "gpt-4-vision-preview"

class ConfigService:
    @staticmethod
    def _ensure_dir():
        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)

    @staticmethod
    def load_settings() -> SettingsModel:
        """Load settings from disk or return defaults."""
        ConfigService._ensure_dir()
        if not os.path.exists(CONFIG_PATH):
            return SettingsModel()
        
        try:
            with open(CONFIG_PATH, 'r') as f:
                data = json.load(f)
            return SettingsModel(**data)
        except Exception as e:
            logger.error(f"Failed to load settings: {e}")
            return SettingsModel()

    @staticmethod
    def save_settings(settings: SettingsModel) -> None:
        """Save settings to disk."""
        ConfigService._ensure_dir()
        try:
            with open(CONFIG_PATH, 'w') as f:
                json.dump(settings.model_dump(), f, indent=4)
            logger.info("Settings saved successfully.")
        except Exception as e:
            logger.error(f"Failed to save settings: {e}")
            raise e
