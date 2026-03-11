from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Alert(Base):
    __tablename__ = "alert"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("device.id"), nullable=False)
    message = Column(String, nullable=False)
    status = Column(String, default="unread")  # "unread", "read", "resolved"
    created_at = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="alerts")