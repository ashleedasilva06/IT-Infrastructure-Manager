from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String, nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=True)
    entity_id = Column(Integer, nullable=True)
    entity_name = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="activity_logs", foreign_keys=[user_id])