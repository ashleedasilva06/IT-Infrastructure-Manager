import asyncio
import subprocess
import platform
from datetime import datetime
from app.database.connection import SessionLocal
from app.models.device import Device
from app.models.alert import Alert
from app.models.device_status import DeviceStatus
from app.models.notification_settings import NotificationSettings


def ping_device(ip: str) -> bool:
    param = "-n" if platform.system().lower() == "windows" else "-c"
    try:
        result = subprocess.run(
            ["ping", param, "1", "-w", "1000", ip],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=5,
        )
        return result.returncode == 0
    except Exception:
        return False


async def send_offline_notifications(device: Device, db):
    try:
        from app.services.email_service import send_email, device_offline_email
        settings_list = db.query(NotificationSettings).filter(
            NotificationSettings.notify_device_offline == True
        ).all()
        for settings in settings_list:
            from app.models.user import User
            user = db.query(User).filter(User.id == settings.user_id).first()
            email = settings.email or (user.email if user else None)
            if email:
                await send_email(
                    subject=f"🔴 Device Offline: {device.name}",
                    recipients=[email],
                    body=device_offline_email(device.name, device.ip_address or ""),
                )
    except Exception as e:
        print(f"[NOTIFY ERROR] {e}")


async def monitor_devices():
    while True:
        db = SessionLocal()
        try:
            devices = db.query(Device).all()
            for device in devices:
                if not device.ip_address:
                    continue

                is_online = ping_device(device.ip_address)
                new_status = "online" if is_online else "offline"
                was_offline = device.status == "offline"

                # Log status history
                status_entry = DeviceStatus(
                    device_id=device.id,
                    status=new_status,
                    timestamp=datetime.utcnow(),
                )
                db.add(status_entry)

                # Generate alert + send email if just went offline
                if not is_online and not was_offline:
                    alert = Alert(
                        device_id=device.id,
                        message=f"{device.name} ({device.ip_address}) went offline",
                        status="unread",
                    )
                    db.add(alert)
                    db.commit()
                    await send_offline_notifications(device, db)

                device.status = new_status
                db.commit()

        except Exception as e:
            print(f"[MONITOR ERROR] {e}")
        finally:
            db.close()

        await asyncio.sleep(30)
