from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.maintenance import Maintenance
from app.models.device import Device
from app.schemas.maintenance_schema import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
from app.services.auth_service import get_current_user, require_admin

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.post("/", response_model=MaintenanceResponse, status_code=201)
def create_maintenance(
    record: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)  # both users and admins can report
):
    device = db.query(Device).filter(Device.id == record.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Regular users can only report issues on their assigned devices
    if current_user.role != "admin":
        from app.models.assignment import Assignment
        assignment = db.query(Assignment).filter(
            Assignment.device_id == record.device_id,
            Assignment.user_id == current_user.id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="You can only report issues on your assigned devices")

    new_record = Maintenance(
        device_id=record.device_id,
        issue=record.issue,
        status="open",
        notes=record.notes,
        maintenance_date=record.maintenance_date,
        reported_by=current_user.name
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@router.get("/", response_model=List[MaintenanceResponse])
def get_maintenance_records(
    device_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Maintenance)

    # Regular users only see maintenance for their assigned devices
    if current_user.role != "admin":
        from app.models.assignment import Assignment
        assigned_device_ids = [
            a.device_id for a in db.query(Assignment).filter(
                Assignment.user_id == current_user.id
            ).all()
        ]
        query = query.filter(Maintenance.device_id.in_(assigned_device_ids))

    if device_id:
        query = query.filter(Maintenance.device_id == device_id)
    if status:
        query = query.filter(Maintenance.status == status)

    return query.order_by(Maintenance.created_at.desc()).all()


@router.get("/{record_id}", response_model=MaintenanceResponse)
def get_maintenance_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    record = db.query(Maintenance).filter(Maintenance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record


@router.put("/{record_id}", response_model=MaintenanceResponse)
def update_maintenance_record(
    record_id: int,
    update: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)  # only admins can update status
):
    record = db.query(Maintenance).filter(Maintenance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    for key, value in update.dict(exclude_none=True).items():
        setattr(record, key, value)

    if update.status == "resolved":
        device = db.query(Device).filter(Device.id == record.device_id).first()
        if device and device.status == "maintenance":
            device.status = "offline"
            db.add(device)

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}")
def delete_maintenance_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    record = db.query(Maintenance).filter(Maintenance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    db.delete(record)
    db.commit()
    return {"message": "Maintenance record deleted"}