from sqlalchemy import Column, Integer, String,Text, Boolean, Float, Date, ForeignKey,DateTime,ARRAY
from db.database import Base
from datetime import date
from datetime import datetime

class Users(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String(10), unique=True, nullable=False)  # Auto-generated 10-digit ID
    fname = Column(String(255), nullable=False)
    mname = Column(String(255), nullable=True)  # Optional middle name
    lname = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(255), nullable=True)
    gender = Column(String(255), nullable=True)
    avatar = Column(Text, nullable=True)
    password_hash = Column(String(255), nullable=False)
    step_account_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Reference to another user
    user_type = Column(String(50), default="citizen")  # citizen, admin, manager, agent
    acc_status = Column(Boolean, default=False)  # For email verification
    created_at = Column(String(255), default=datetime.utcnow)


class OTP(Base):
    __tablename__ = "sent_otps"
    #
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, index=True)
    otp_code = Column(String, index=True)
    verification_code = Column(String, index=True)
    purpose = Column(String, index=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)

