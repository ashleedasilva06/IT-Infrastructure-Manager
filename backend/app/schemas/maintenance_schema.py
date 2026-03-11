from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class MaintenanceCreate(BaseModel):
    device_id: int
    issue: str
    status: Optional[str] = "open"
    notes: Optional[str] = None
    maintenance_date: date


class MaintenanceUpdate(BaseModel):
    issue: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    maintenance_date: Optional[date] = None


class MaintenanceResponse(BaseModel):
    id: int
    device_id: int
    issue: str
    status: str
    notes: Optional[str]
    maintenance_date: date
    reported_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True