from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.alert import Alert
from app.schemas.alert_schema import AlertResponse, AlertUpdate
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/", response_model=List[AlertResponse])
def get_alerts(
    device_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Alert)
    if device_id:
        query = query.filter(Alert.device_id == device_id)
    if status:
        query = query.filter(Alert.status == status)
    return query.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert_status(
    alert_id: int,
    update: AlertUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if update.status:
        alert.status = update.status
    db.commit()
    db.refresh(alert)
    return alert