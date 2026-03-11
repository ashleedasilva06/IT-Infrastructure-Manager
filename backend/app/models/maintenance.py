from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("device.id"), nullable=False)
    issue = Column(String, nullable=False)
    status = Column(String, default="open")
    notes = Column(String, nullable=True)
    maintenance_date = Column(Date, nullable=False)
    reported_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="maintenance_records")