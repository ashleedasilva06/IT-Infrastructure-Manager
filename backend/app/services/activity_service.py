from app.database.connection import SessionLocal
from app.models.activity_log import ActivityLog


def log_activity(
    user_id: int,
    user_name: str,
    action: str,
    entity_type: str = None,
    entity_id: int = None,
    entity_name: str = None,
    details: str = None,
    ip_address: str = None,
):
    db = SessionLocal()
    try:
        entry = ActivityLog(
            user_id=user_id,
            user_name=user_name,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_name=entity_name,
            details=details,
            ip_address=ip_address,
        )
        db.add(entry)
        db.commit()
    finally:
        db.close()