from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Text, Enum, DECIMAL, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    internal_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    logto_id = Column(String(255), unique=True, nullable=False)
    email = Column(String(100))
    phone_no = Column(String(20))
    nickname = Column(String(100))
    gender = Column(Enum('male', 'female', 'other', 'secret'), default='secret')
    birthday = Column(Date)
    default_currency = Column(String(3), default='USD')
    role = Column(Enum('customer', 'VIP', 'staff', 'admin'), default='customer')
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=False)
    sms_notifications = Column(Boolean, default=False)
    last_login = Column(DateTime, default=datetime.datetime.now)
    created_at = Column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
    deleted_at = Column(DateTime, nullable=True)
    isActive = Column(Boolean, default=True)
    
