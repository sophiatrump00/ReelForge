import os
import shutil
from datetime import datetime
import logging
from typing import Dict

logger = logging.getLogger(__name__)

class MaterialOrganizer:
    def __init__(self, base_output_dir: str = "/app/data/output"):
        self.base_dir = base_output_dir

    def organize_material(self, filepath: str, placement: str, metadata: Dict) -> str:
        """
        Move file to organized structure: {date}/{placement}/
        Input metadata expects 'date' (YYYYMMDD) or uses today.
        """
        date_str = metadata.get('date', datetime.now().strftime('%Y%m%d'))
        
        target_dir = os.path.join(self.base_dir, date_str, placement)
        os.makedirs(target_dir, exist_ok=True)
        
        filename = os.path.basename(filepath)
        # Optional: Rename based on template
        # new_name = f"{metadata.get('creator')}_{date_str}_{filename}"
        new_name = filename 
        
        target_path = os.path.join(target_dir, new_name)
        
        try:
            shutil.move(filepath, target_path)
            logger.info(f"Moved {filepath} -> {target_path}")
            return target_path
        except Exception as e:
            logger.error(f"Failed to organize file: {e}")
            raise e
