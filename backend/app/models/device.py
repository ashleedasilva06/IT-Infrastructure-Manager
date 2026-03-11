from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base

class Device(Base):
    __tablename__ = "device"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    serial_number = Column(String, unique=True, nullable=False)
    ip_address = Column(String, unique=True, nullable=False)
    mac_address = Column(String, unique=True, nullable=False)
    location = Column(String, nullable=False)
    status = Column(String, default="offline")  # "online", "offline", "maintenance"
    purchase_date = Column(Date, nullable=False)
    warranty_expiry = Column(Date, nullable=False)

    alerts = relationship("Alert", back_populates="device", cascade="all, delete-orphan")
    statuses = relationship("DeviceStatus", back_populates="device", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="device", cascade="all, delete-orphan")
    maintenance_records = relationship("Maintenance", back_populates="device", cascade="all, delete-orphan")