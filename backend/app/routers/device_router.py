from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.device import Device
from app.schemas.device_schema import DeviceCreate, DeviceUpdate, DeviceResponse
from app.services.auth_service import get_current_user, require_admin
from app.services.activity_service import log_activity
from typing import List

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.get("/", response_model=List[DeviceResponse])
def get_devices(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Device).all()


@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.post("/", response_model=DeviceResponse)
def create_device(device: DeviceCreate, request: Request, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    new_device = Device(**device.dict())
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    log_activity(
        user_id=current_user.id,
        user_name=current_user.name,
        action="Created device",
        entity_type="device",
        entity_id=new_device.id,
        entity_name=new_device.name,
        details=f"IP: {new_device.ip_address}, Type: {new_device.type}",
        ip_address=request.client.host,
    )
    return new_device


@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(device_id: int, device: DeviceUpdate, request: Request, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    existing = db.query(Device).filter(Device.id == device_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Device not found")
    for key, value in device.dict(exclude_unset=True).items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    log_activity(
        user_id=current_user.id,
        user_name=current_user.name,
        action="Updated device",
        entity_type="device",
        entity_id=existing.id,
        entity_name=existing.name,
        details=f"Status: {existing.status}",
        ip_address=request.client.host,
    )
    return existing


@router.delete("/{device_id}")
def delete_device(device_id: int, request: Request, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    name = device.name
    db.delete(device)
    db.commit()
    log_activity(
        user_id=current_user.id,
        user_name=current_user.name,
        action="Deleted device",
        entity_type="device",
        entity_id=device_id,
        entity_name=name,
        ip_address=request.client.host,
    )
    return {"message": "Device deleted"}


@router.get("/{device_id}/detail")
def get_device_detail(device_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.alert import Alert
    from app.models.maintenance import Maintenance
    from app.models.device_status import DeviceStatus
    from app.models.assignment import Assignment

    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    alerts = db.query(Alert).filter(Alert.device_id == device_id).order_by(Alert.created_at.desc()).limit(10).all()
    maintenance = db.query(Maintenance).filter(Maintenance.device_id == device_id).order_by(Maintenance.created_at.desc()).limit(10).all()
    history = db.query(DeviceStatus).filter(DeviceStatus.device_id == device_id).order_by(DeviceStatus.timestamp.desc()).limit(20).all()
    assignment = db.query(Assignment).filter(Assignment.device_id == device_id).order_by(Assignment.created_at.desc()).first()

    online_count = sum(1 for h in history if h.status == "online")
    offline_count = sum(1 for h in history if h.status == "offline")

    return {
        "device": {
            "id": device.id, "name": device.name, "type": device.type,
            "brand": device.brand, "serial_number": device.serial_number,
            "ip_address": device.ip_address, "mac_address": device.mac_address,
            "location": device.location, "status": device.status,
            "purchase_date": device.purchase_date, "warranty_expiry": device.warranty_expiry,
        },
        "alerts": [{"id": a.id, "message": a.message, "status": a.status, "created_at": a.created_at} for a in alerts],
        "maintenance": [{"id": m.id, "issue": m.issue, "status": m.status, "maintenance_date": m.maintenance_date, "reported_by": m.reported_by} for m in maintenance],
        "history": [{"status": h.status, "timestamp": h.timestamp} for h in history],
        "assignment": {"employee_name": assignment.employee_name, "department": assignment.department, "assigned_date": assignment.assigned_date} if assignment else None,
        "uptime_pct": round((online_count / (online_count + offline_count)) * 100) if (online_count + offline_count) > 0 else None,
    }