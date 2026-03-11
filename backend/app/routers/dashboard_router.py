from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.database.connection import get_db
from app.models.device import Device
from app.models.alert import Alert
from app.models.maintenance import Maintenance
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    total_devices = db.query(Device).count()
    online_devices = db.query(Device).filter(Device.status == "online").count()
    offline_devices = db.query(Device).filter(Device.status == "offline").count()
    maintenance_devices = db.query(Device).filter(Device.status == "maintenance").count()
    total_alerts = db.query(Alert).count()
    unread_alerts = db.query(Alert).filter(Alert.status == "unread").count()
    open_maintenance = db.query(Maintenance).filter(Maintenance.status == "open").count()

    # Warranty expiring within 30 days
    today = date.today()
    in_30_days = today + timedelta(days=30)
    expiring_soon = db.query(Device).filter(
        Device.warranty_expiry <= in_30_days,
        Device.warranty_expiry >= today
    ).all()

    # Already expired
    already_expired = db.query(Device).filter(
        Device.warranty_expiry < today
    ).all()

    latest_alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()
    alerts_list = [
        {
            "id": a.id,
            "device_id": a.device_id,
            "message": a.message,
            "status": a.status,
            "created_at": a.created_at
        }
        for a in latest_alerts
    ]

    return {
        "total_devices": total_devices,
        "online_devices": online_devices,
        "offline_devices": offline_devices,
        "maintenance_devices": maintenance_devices,
        "total_alerts": total_alerts,
        "unread_alerts": unread_alerts,
        "open_maintenance": open_maintenance,
        "warranty_expiring_soon": len(expiring_soon),
        "warranty_expired": len(already_expired),
        "expiring_devices": [
            {
                "id": d.id,
                "name": d.name,
                "warranty_expiry": d.warranty_expiry,
                "days_left": (d.warranty_expiry - today).days
            }
            for d in expiring_soon
        ],
        "expired_devices": [
            {
                "id": d.id,
                "name": d.name,
                "warranty_expiry": d.warranty_expiry,
            }
            for d in already_expired
        ],
        "latest_alerts": alerts_list
    }