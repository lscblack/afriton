from sqlalchemy import Column, Integer, String,Text, Boolean, Float, Date, ForeignKey,DateTime,ARRAY, UniqueConstraint
from db.database import Base
from datetime import date
from datetime import datetime
from sqlalchemy.orm import relationship

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
    is_wallet_active = Column(Boolean, default=False)
    created_at = Column(String(255), default=datetime.utcnow)


class OTP(Base):
    __tablename__ = "sent_otps"
    #
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String, index=True)
    otp_code = Column(String, index=True)
    verification_code = Column(String, index=True)
    purpose = Column(String, index=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)


class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String, index=True)
    balance = Column(Float, default=0.0)
    wallet_status = Column(Boolean, default=True)
    wallet_type = Column(String, default="savings")  # savings, goal, business, family, emergency, agent-wallet, manager-wallet
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
# history table
class Transaction_history(Base):
    __tablename__ = "Transaction_history"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String, index=True)
    transaction_type = Column(String, index=True)
    amount = Column(Float, default=0.0)
    original_amount = Column(Float, nullable=True)  # Original amount before conversion
    original_currency = Column(String(50), nullable=True)  # Original currency code
    wallet_type = Column(String(50), nullable=True)  # Add wallet type field
    done_by = Column(String, index=True)
    status = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

#withdrawal table request
class Withdrawal_request(Base):
    __tablename__ = "withdrawal_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String)
    amount = Column(Float)  # Base amount in Afriton
    withdrawal_amount = Column(Float)  # Amount in withdrawal currency
    withdrawal_currency = Column(String)
    wallet_type = Column(String)
    status = Column(String, default="Pending")
    request_to = Column(String, default="agent")
    processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    done_by = Column(String, nullable=True)
    total_amount = Column(Float)  # Total amount including fees in Afriton
    charges = Column(Float)  # Fees in Afriton
    agent_commission = Column(Float, nullable=True)
    manager_commission = Column(Float, nullable=True)
    platform_profit = Column(Float, nullable=True)

class Workers(Base):
    __tablename__ = "workers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    allowed_balance = Column(Float, default=0.0)
    available_balance = Column(Float, default=0.0)
    location = Column(String(255), nullable=False)
    worker_type = Column(String(50), nullable=False)  # manager or agent
    managed_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # For agents, references their manager
    created_at = Column(DateTime, default=datetime.utcnow)

class Profit(Base):
    __tablename__ = "profits"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)  # System profit amount
    fee_type = Column(String, nullable=False)  # withdrawal or deposit
    transaction_amount = Column(Float, nullable=False)  # Original transaction amount
    transaction_date = Column(DateTime, default=datetime.utcnow)

class CurrencyCategory(Base):
    __tablename__ = "currency_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # e.g. "african_currencies"
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CurrencyRate(Base):
    __tablename__ = "currency_rates"
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("currency_categories.id"), nullable=False)
    currency_name = Column(String(100), nullable=False)  # e.g. "rwandan_franc"
    currency_code = Column(String(10), nullable=False)   # e.g. "RWF"
    rate_to_afriton = Column(Float, nullable=False)      # e.g. 12000 (means 12000 RWF = 1 Afriton)
    is_active = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('currency_code', name='unique_currency_code'),
    )
