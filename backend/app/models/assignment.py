from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("device.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    employee_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    assigned_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="assignments")
    user = relationship("User", back_populates="assignments")