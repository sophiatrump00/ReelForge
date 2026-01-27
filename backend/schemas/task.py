from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from enum import Enum
from datetime import datetime

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class DownloadRequest(BaseModel):
    url: str
    is_batch: bool = False
    cookies_path: Optional[str] = None
    options: Optional[Dict[str, Any]] = None

class ProcessingTask(BaseModel):
    id: str
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
    result: Optional[Any] = None
    error: Optional[str] = None
