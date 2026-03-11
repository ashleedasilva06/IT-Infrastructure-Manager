from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.models.activity_log import ActivityLog
from app.services.auth_service import require_admin

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.get("/")
def get_activity_logs(
    skip: int = 0,
    limit: int = 50,
    entity_type: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    query = db.query(ActivityLog).order_by(ActivityLog.created_at.desc())
    if entity_type:
        query = query.filter(ActivityLog.entity_type == entity_type)
    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    total = query.count()
    logs = query.offset(skip).limit(limit).all()
    return {
        "total": total,
        "logs": [
            {
                "id": l.id,
                "user_id": l.user_id,
                "user_name": l.user_name,
                "action": l.action,
                "entity_type": l.entity_type,
                "entity_id": l.entity_id,
                "entity_name": l.entity_name,
                "details": l.details,
                "ip_address": l.ip_address,
                "created_at": l.created_at,
            }
            for l in logs
        ],
    }