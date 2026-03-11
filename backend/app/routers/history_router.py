from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.models.device_status import DeviceStatus
from app.models.device import Device
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/history", tags=["History"])


@router.get("/")
def get_device_history(
    device_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(DeviceStatus)
    if device_id:
        query = query.filter(DeviceStatus.device_id == device_id)
    records = query.order_by(DeviceStatus.timestamp.desc()).limit(limit).all()

    return [
        {
            "id": r.id,
            "device_id": r.device_id,
            "device_name": r.device.name if r.device else "Unknown",
            "status": r.status,
            "timestamp": r.timestamp,
        }
        for r in records
    ]


@router.get("/summary")
def get_history_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    devices = db.query(Device).all()
    summary = []

    for device in devices:
        statuses = db.query(DeviceStatus).filter(
            DeviceStatus.device_id == device.id
        ).order_by(DeviceStatus.timestamp.desc()).limit(10).all()

        online_count = sum(1 for s in statuses if s.status == "online")
        offline_count = sum(1 for s in statuses if s.status == "offline")
        last_seen = statuses[0].timestamp if statuses else None

        summary.append({
            "device_id": device.id,
            "device_name": device.name,
            "current_status": device.status,
            "ip_address": device.ip_address,
            "online_count": online_count,
            "offline_count": offline_count,
            "last_seen": last_seen,
            "recent_history": [
                {"status": s.status, "timestamp": s.timestamp}
                for s in statuses[:5]
            ]
        })

    return summary
@router.get("/chart-data")
def get_chart_data(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from datetime import datetime, timedelta
    from app.models.device_status import DeviceStatus

    # Get last 24 hours of data in hourly buckets
    now = datetime.utcnow()
    buckets = []

    for i in range(23, -1, -1):
        bucket_start = now - timedelta(hours=i+1)
        bucket_end = now - timedelta(hours=i)
        label = bucket_end.strftime("%H:%M")

        statuses = db.query(DeviceStatus).filter(
            DeviceStatus.timestamp >= bucket_start,
            DeviceStatus.timestamp < bucket_end
        ).all()

        online = sum(1 for s in statuses if s.status == "online")
        offline = sum(1 for s in statuses if s.status == "offline")

        # If no status changes in this bucket use current device counts
        if online == 0 and offline == 0:
            online = db.query(Device).filter(Device.status == "online").count()
            offline = db.query(Device).filter(Device.status == "offline").count()

        buckets.append({
            "time": label,
            "online": online,
            "offline": offline,
        })

    return buckets