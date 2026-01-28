import shutil
import logging
from typing import Dict

logger = logging.getLogger(__name__)

class StorageMonitor:
    def __init__(self, path: str = "/app/data"):
        self.path = path

    def check_usage(self) -> Dict:
        """
        Check disk usage of the data directory.
        """
        total, used, free = shutil.disk_usage(self.path)
        
        percent_used = (used / total) * 100
        
        status = "ok"
        if percent_used > 90:
            status = "critical"
        elif percent_used > 80:
            status = "warning"
            
        return {
            "total_gb": round(total / (1024**3), 2),
            "used_gb": round(used / (1024**3), 2),
            "free_gb": round(free / (1024**3), 2),
            "percent": round(percent_used, 1),
            "status": status
        }
