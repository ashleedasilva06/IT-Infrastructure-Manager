# app/models/device_status.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class DeviceStatus(Base):
    __tablename__ = "device_status"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("device.id"), nullable=False)
    status = Column(String, nullable=False)  # "online" or "offline"
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationship
    device = relationship("Device", back_populates="statuses")