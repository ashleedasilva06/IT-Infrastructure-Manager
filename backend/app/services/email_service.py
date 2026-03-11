from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from typing import List
import os

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@itmanager.com"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "IT Infrastructure Manager"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)


async def send_email(
    subject: str,
    recipients: List[str],
    body: str,
):
    try:
        message = MessageSchema(
            subject=subject,
            recipients=recipients,
            body=body,
            subtype=MessageType.html,
        )
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")


def device_offline_email(device_name: str, ip: str) -> str:
    return f"""
    <div style="font-family: monospace; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px; max-width: 560px;">
        <div style="background: #ef4444; color: white; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 24px;">
            🔴 DEVICE OFFLINE
        </div>
        <h2 style="color: #f1f5f9; margin: 0 0 8px 0;">{device_name}</h2>
        <p style="color: #94a3b8; margin: 0 0 24px 0;">IP Address: <strong style="color: #e2e8f0;">{ip}</strong></p>
        <p style="color: #94a3b8;">This device has gone offline and may require attention.</p>
        <hr style="border-color: #1e293b; margin: 24px 0;" />
        <p style="color: #475569; font-size: 12px;">IT Infrastructure Manager · Automated Alert</p>
    </div>
    """


def warranty_expiry_email(device_name: str, days_left: int, expiry_date: str) -> str:
    color = "#ef4444" if days_left <= 0 else "#f59e0b"
    label = "WARRANTY EXPIRED" if days_left <= 0 else f"WARRANTY EXPIRING IN {days_left} DAYS"
    return f"""
    <div style="font-family: monospace; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px; max-width: 560px;">
        <div style="background: {color}; color: white; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 24px;">
            ⚠️ {label}
        </div>
        <h2 style="color: #f1f5f9; margin: 0 0 8px 0;">{device_name}</h2>
        <p style="color: #94a3b8; margin: 0 0 24px 0;">Warranty Expiry: <strong style="color: #e2e8f0;">{expiry_date}</strong></p>
        <p style="color: #94a3b8;">Please renew the warranty or plan for device replacement.</p>
        <hr style="border-color: #1e293b; margin: 24px 0;" />
        <p style="color: #475569; font-size: 12px;">IT Infrastructure Manager · Automated Alert</p>
    </div>
    """


def new_alert_email(device_name: str, message: str) -> str:
    return f"""
    <div style="font-family: monospace; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px; max-width: 560px;">
        <div style="background: #6366f1; color: white; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 24px;">
            🔔 NEW ALERT
        </div>
        <h2 style="color: #f1f5f9; margin: 0 0 8px 0;">{device_name}</h2>
        <p style="color: #94a3b8; margin: 0 0 24px 0;">{message}</p>
        <hr style="border-color: #1e293b; margin: 24px 0;" />
        <p style="color: #475569; font-size: 12px;">IT Infrastructure Manager · Automated Alert</p>
    </div>
    """