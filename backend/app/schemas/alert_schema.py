from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AlertResponse(BaseModel):
    id: int
    device_id: int
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AlertUpdate(BaseModel):
    status: Optional[str] = None  # "unread", "read", "resolved"