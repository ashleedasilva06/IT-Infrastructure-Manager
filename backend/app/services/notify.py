from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import List

conf = ConnectionConfig(
    MAIL_USERNAME="your_email@gmail.com",
    MAIL_PASSWORD="your_app_password",
    MAIL_FROM="your_email@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

async def send_email(subject: str, recipients: List[str], body: str):
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)