from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class AssignmentCreate(BaseModel):
    device_id: int
    user_id: Optional[int] = None
    employee_name: str
    department: str
    assigned_date: date


class AssignmentUpdate(BaseModel):
    user_id: Optional[int] = None
    employee_name: Optional[str] = None
    department: Optional[str] = None
    assigned_date: Optional[date] = None


class AssignmentResponse(BaseModel):
    id: int
    device_id: int
    user_id: Optional[int]
    employee_name: str
    department: str
    assigned_date: date
    created_at: datetime

    class Config:
        from_attributes = True