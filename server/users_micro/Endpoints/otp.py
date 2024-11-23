from fastapi import APIRouter, HTTPException,status
from db.VerifyToken import user_Front_dependency,user_dependency
from dotenv import load_dotenv
import random
from db.connection import db_dependency
from models.userModels import Users, OTP, Workers, Wallet
from typing import Literal
from functions.send_mail import send_new_email
from functions.send_mulltiple import send_new_multi_email
from emailsTemps.custom_email_send import custom_email
from schemas.emailSchemas import EmailSchema, OtpVerify
from datetime import datetime,timedelta
# Load environment variables from .env file
load_dotenv()

router = APIRouter(prefix="/auth", tags=["Send Notifications and OTP"])


# send Otp
@router.post(
    "/send-otp/",
    description="""\
    Sends an OTP (One-Time Password) to the specified email address for verification purposes.
    ### Request Body
    Provide the following JSON object:

    ```
    {
    "purpose": "login",
    "toEmail": "user@example.com"
    }
    ```
    The OTP type can be one of:
    ```
    ["login", "email", "reset", "transaction"]
    ```
    - login: For account login verification
    - email: For email address verification
    - reset: For password reset verification
    - transaction: For secure transaction verification
    """,
)
async def send_email(userFront:user_Front_dependency, details: EmailSchema, db: db_dependency):
    if isinstance(userFront, HTTPException):
        raise userFront

    if "dev" != userFront['acc_type']:
        raise HTTPException(status_code=403, detail="Not Allowed To This Action only Afriton apps allowed!")
    
    otp_subjet = {
        "login": "Afriton Security - Login Verification Code",
        "email": "Afriton - Email Address Verification",
        "reset": "Afriton - Account Recovery Code",
        "transaction": "Afriton - Transaction Authorization Code",
        "Info": "Afriton - Account Access Verification",
    }
    otp = random.randint(100000, 999999)  # Generates a 6-digit OTP
    verification = random.randint(1000000, 9999999)  # Generates a 7-digit Verification OTP
    purpose = details.purpose

    # Only check for existing user if purpose is not email verification
    if purpose != "email":
        user = db.query(Users).filter(Users.email == details.toEmail).first()
        if not user:
            raise HTTPException(status_code=404, detail="Email Id Not Found")
        account_id = user.email
        fname = user.fname
    else:
        # For email verification, use email as account_id
        account_id = details.toEmail
        fname = "Afriton User"  # Generic name for email verification

    # Remove existing OTPs if any
    existing_otp = db.query(OTP).filter(
        OTP.account_id == account_id,
        OTP.purpose == purpose
    ).first()
    if existing_otp:
        db.delete(existing_otp)
        db.commit()

    # Create and store the new OTP
    new_otp = OTP(
        account_id=account_id,  # Using email for email verification
        otp_code=otp,
        verification_code=verification,
        purpose=purpose
    )
    
    db.add(new_otp)
    db.commit()
    db.refresh(new_otp)

    heading = "Afriton Security Alert"
    sub = otp_subjet[purpose]
    body = f"""
    <h1>{otp}</h1>
    <p>This is your verification code for <b>{purpose}</b>.</p>
    <p>For your security:</p>
    <ul>
        <li>Never share this code with anyone</li>
        <li>Afriton will never ask for your OTP via phone or email</li>
        <li>This code expires in 10 minutes</li>
    </ul>
    <p>If you didn't request this code, please secure your account immediately.</p>
    """
    msg = custom_email(fname, heading, body)
    if send_new_email(details.toEmail, sub, msg):
        return {"message": "Email sent successfully", "verification_Code": verification}


@router.post("/verify-otp")
async def verify_opt(userFront:user_Front_dependency, data: OtpVerify, db: db_dependency):
    if isinstance(userFront, HTTPException):
        raise userFront

    if "dev" != userFront['acc_type']:
        raise HTTPException(status_code=403, detail="Not Allowed To This Action only Nova apps allowed!")
    
    # For reset purpose, use email as account_id
    account_id = data.email
    
    print(f"Checking OTP: {data.otp_code}, verification: {data.verification_code}, email: {account_id}, purpose: {data.purpose}")  # Debug print
    
    valid_otp = db.query(OTP).filter(
        OTP.otp_code == str(data.otp_code),  # Convert to string for comparison
        OTP.verification_code == str(data.verification_code),
        OTP.account_id == account_id,
        OTP.purpose == data.purpose
    ).first()
    
    if not valid_otp:
        # Debug print to see what's in the database
        existing_otp = db.query(OTP).filter(OTP.account_id == account_id).first()
        if existing_otp:
            print(f"Found OTP in DB: code={existing_otp.otp_code}, verification={existing_otp.verification_code}, purpose={existing_otp.purpose}")
        raise HTTPException(status_code=404, detail="Invalid security code")
    
    if datetime.utcnow() - valid_otp.date > timedelta(minutes=10):
        raise HTTPException(status_code=404, detail="Security code has expired. Please request a new one")
    
    # Clean up the OTP
    db.delete(valid_otp)
    db.commit()
    
    return {"detail": "Successfully Verified", "canProceed": True}

@router.get("/api/all/users")
def get_all_userss(
    db: db_dependency,
    user: user_dependency,
    skip: int = 0,
    limit: int = 100,
):
    if isinstance(user, HTTPException):
        raise user
    #check user type from database
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user.user_type == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Persmission Denied"
        )
    """Get all All with pagination"""
    users = db.query(Users).offset(skip).limit(limit).all()
    return users


@router.post("send_emails",description="This Endpoint Will Be used To eamils to all users")
async def send_emails_to_users(
    db: db_dependency,
    user: user_dependency,
    Emails:list[str],
    subject:str,
    msg:str,
):
        # Example usage
    Email_to_list = Emails
    Email_sub = subject
    Email_msg = msg

    Email_msg = custom_email("Adroit User","Adroit Updates",Email_msg)
    try:
        send_new_multi_email(Email_to_list, Email_sub, Email_msg)
        # Return a 201 status code for successful email sending
        return {"message": "Emails sent successfully!"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to send emails: {e}"
        )
    
# change user type if your admin can change to any type or manager can user to agent only
@router.post("/change-user-type")
def change_user_type(
    user: user_dependency, 
    db: db_dependency,
    user_type: Literal["manager", "agent"],
    user_id: int,
    location: str
):
    if isinstance(user, HTTPException):
        raise user
        
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user or (check_user.user_type not in ["admin", "manager"]):
        raise HTTPException(status_code=403, detail="Permission Denied")

    # Check if user exists
    user_to_change = db.query(Users).filter(Users.id == user_id).first()
    if not user_to_change:
        raise HTTPException(status_code=404, detail="User not found")

    # Manager can only create agents in their location
    if check_user.user_type == "manager":
        if user_type != "agent":
            raise HTTPException(status_code=403, detail="Managers can only create agents")
            
        # Get manager's worker record
        manager_worker = db.query(Workers).filter(Workers.user_id == check_user.id).first()
        if not manager_worker or manager_worker.location != location:
            raise HTTPException(status_code=403, detail="Managers can only create agents in their location")

    # Set default allowed balance based on worker type
    allowed_balance = 5000 if user_type == "agent" else 100000

    # Check if user is already a worker
    existing_worker = db.query(Workers).filter(Workers.user_id == user_id).first()
    if existing_worker:
        raise HTTPException(status_code=400, detail="User is already a worker")

    # Create worker record
    new_worker = Workers(
        user_id=user_id,
        allowed_balance=allowed_balance,
        available_balance=allowed_balance,
        location=location,
        worker_type=user_type,
        managed_by=check_user.id if user_type == "agent" else None
    )
    
    # Update user type and activate wallet
    user_to_change.user_type = user_type
    user_to_change.is_wallet_active = True  # Set wallet active when changing role
    
    # Create commission wallet for the new agent/manager
    commission_wallet = Wallet(
        account_id=user_to_change.account_id,
        balance=0.0,
        wallet_type=f"{user_type}-wallet", #agent-wallet or manager-wallet
        wallet_status=True
    )
    
    # Create savings wallet if it doesn't exist
    savings_wallet = db.query(Wallet).filter(
        Wallet.account_id == user_to_change.account_id,
        Wallet.wallet_type == "savings"
    ).first()
    
    if not savings_wallet:
        savings_wallet = Wallet(
            account_id=user_to_change.account_id,
            balance=0.0,
            wallet_type="savings",
            wallet_status=True
        )
        db.add(savings_wallet)
    
    db.add(new_worker)
    db.add(commission_wallet)
    db.commit()

    # Send email notification
    heading = "Afriton Role Update"
    sub = "Your Role Has Been Updated"
    body = f"""
    <p>Hi {user_to_change.fname},</p>
    <p>Your role has been updated to {user_type}.</p>
    <p>Location: {location}</p>
    <p>Available Balance: {allowed_balance} Afriton</p>
    <p>Two wallets have been created for you:</p>
    <ul>
        <li>Commission Wallet: For receiving commission on transactions</li>
        <li>Savings Wallet: For your personal savings</li>
    </ul>
    <p>You will receive 3% commission on all withdrawals processed.</p>
    """
    msg = custom_email(user_to_change.fname, heading, body)
    
    if send_new_email(user_to_change.email, sub, msg):
        return {
            "message": "User type changed and wallets created successfully",
            "details": {
                "user_type": user_type,
                "location": location,
                "allowed_balance": allowed_balance,
                "wallets": [
                    {"type": f"{user_type}-wallet", "balance": 0.0},
                    {"type": "savings", "balance": 0.0}
                ]
            }
        }
    else:
        return {
            "message": "User type changed and wallets created but email notification failed",
            "details": {
                "user_type": user_type,
                "location": location,
                "allowed_balance": allowed_balance,
                "wallets": [
                    {"type": f"{user_type}-wallet", "balance": 0.0},
                    {"type": "savings", "balance": 0.0}
                ]
            }
        }
    
    
