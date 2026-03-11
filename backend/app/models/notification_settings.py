from sqlalchemy import Column, Integer, Boolean, String, ForeignKey
from app.database.connection import Base

class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    email = Column(String, nullable=True)
    notify_device_offline = Column(Boolean, default=True)
    notify_warranty_expiry = Column(Boolean, default=True)
    notify_new_alerts = Column(Boolean, default=False)