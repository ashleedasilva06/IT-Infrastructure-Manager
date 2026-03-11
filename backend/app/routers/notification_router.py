from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.notification_settings import NotificationSettings
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/settings")
def get_settings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    settings = db.query(NotificationSettings).filter(
        NotificationSettings.user_id == current_user.id
    ).first()

    if not settings:
        return {
            "email": current_user.email,
            "notify_device_offline": True,
            "notify_warranty_expiry": True,
            "notify_new_alerts": False,
        }

    return {
        "email": settings.email or current_user.email,
        "notify_device_offline": settings.notify_device_offline,
        "notify_warranty_expiry": settings.notify_warranty_expiry,
        "notify_new_alerts": settings.notify_new_alerts,
    }


@router.put("/settings")
def update_settings(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    settings = db.query(NotificationSettings).filter(
        NotificationSettings.user_id == current_user.id
    ).first()

    if not settings:
        settings = NotificationSettings(user_id=current_user.id)
        db.add(settings)

    if "email" in data:
        settings.email = data["email"]
    if "notify_device_offline" in data:
        settings.notify_device_offline = data["notify_device_offline"]
    if "notify_warranty_expiry" in data:
        settings.notify_warranty_expiry = data["notify_warranty_expiry"]
    if "notify_new_alerts" in data:
        settings.notify_new_alerts = data["notify_new_alerts"]

    db.commit()
    return {"message": "Settings updated"}


@router.post("/test")
async def send_test_email(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.email_service import send_email
    settings = db.query(NotificationSettings).filter(
        NotificationSettings.user_id == current_user.id
    ).first()
    email = settings.email if settings and settings.email else current_user.email
    await send_email(
        subject="✅ IT Manager — Test Email",
        recipients=[email],
        body=f"""
        <div style="font-family: monospace; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px; max-width: 560px;">
            <div style="background: #22c55e; color: white; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 24px;">
                ✅ EMAIL WORKING
            </div>
            <h2 style="color: #f1f5f9; margin: 0 0 8px 0;">Test Email</h2>
            <p style="color: #94a3b8;">Your email notifications are set up correctly.</p>
            <hr style="border-color: #1e293b; margin: 24px 0;" />
            <p style="color: #475569; font-size: 12px;">IT Infrastructure Manager · {current_user.name}</p>
        </div>
        """,
    )
    return {"message": f"Test email sent to {email}"}