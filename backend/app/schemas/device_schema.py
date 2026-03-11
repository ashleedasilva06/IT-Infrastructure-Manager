from pydantic import BaseModel
from typing import Optional
from datetime import date


class DeviceCreate(BaseModel):
    name: str
    type: Optional[str] = None
    brand: Optional[str] = None
    serial_number: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "online"
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None


class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    brand: Optional[str] = None
    serial_number: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None

    model_config = {"extra": "ignore"}


class DeviceResponse(BaseModel):
    id: int
    name: Optional[str] = None
    type: Optional[str] = None
    brand: Optional[str] = None
    serial_number: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None

    model_config = {"from_attributes": True}