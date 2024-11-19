from fastapi import APIRouter, HTTPException,status
from db.VerifyToken import user_Front_dependency,user_dependency
from dotenv import load_dotenv
import random
from db.connection import db_dependency
from models.userModels import Users, OTP
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
async def send_email(userFront:user_Front_dependency,details: EmailSchema, db: db_dependency):
    if isinstance(userFront, HTTPException):
        raise userFront  # Re-raise the HTTPException if user is an instance of it

    if "dev" != userFront['acc_type']:
        raise HTTPException(status_code=403, detail="Not Allowed To This Action only Adroit apps allowed!")
    
    user = db.query(Users).filter(Users.email == details.toEmail).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email Id Not Found")

    otp_subjet = {
        "login": "Afriton Security - Login Verification Code",
        "email": "Afriton - Email Address Verification",
        "reset": "Afriton - Account Recovery Code",
        "transaction": "Afriton - Transaction Authorization Code",
        "Info": "Afriton - Account Access Verification",
    }
    otp = random.randint(100000, 999999)  # Generates a 6-digit OTP
    verification = random.randint(
        1000000, 9999999
    )  # Generates a 7-digit Verification OTP
    purpose = details.purpose
    # Remove existing OTPs for the user if any
    otp_user = db.query(OTP).filter(OTP.account_id == user.id).first()
    # If record exists, delete it
    if otp_user:
        db.delete(otp_user)
        db.commit()
    # Create and store the new OTP
    new_otp = OTP(account_id=user.id, otp_code=otp, verification_code=verification, purpose=purpose)
    
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
    msg = custom_email(user.fname,heading,body)
    if send_new_email(details.toEmail, sub, msg):
        return {"message": "Email sent successfully", "verification_Code": verification}


@router.post("/verify-otp")
async def verify_opt(userFront:user_Front_dependency, data: OtpVerify, db: db_dependency):
    if isinstance(userFront, HTTPException):
        raise userFront

    if "dev" != userFront['acc_type']:
        raise HTTPException(status_code=403, detail="Not Allowed To This Action only Nova apps allowed!")
    
    user_info = db.query(Users).filter(Users.email == data.email).first()
    
    # # Check if user exists and is already verified
    # if user_info and user_info.acc_status:
    #     raise HTTPException(status_code=400, detail="Email already verified. Please login.")
    
    valid_otp = db.query(OTP).filter(
        OTP.otp_code == data.otp_code,
        OTP.verification_code == data.verification_code,
        OTP.account_id == user_info.id if user_info else None
    ).first()
    
    if not valid_otp:
        raise HTTPException(status_code=404, detail="Invalid security code")
    
    if datetime.utcnow() - valid_otp.date > timedelta(minutes=10):
        raise HTTPException(status_code=404, detail="Security code has expired. Please request a new one")
    
    if valid_otp.purpose == "email":
        if user_info:
            # If user exists but not verified, update status
            user_info.acc_status = True
            db.commit()
            db.refresh(user_info)
        
        db.delete(valid_otp)
        db.commit()
        return {"detail": "Successfully Verified", "canProceed": True}
    
    db.delete(valid_otp)
    db.commit()
    return {"detail": "Successfully Verified"}

@router.get("/api/all/users")
def get_all_userss(
    db: db_dependency,
    user: user_dependency,
    skip: int = 0,
    limit: int = 100,
):
    if isinstance(user, HTTPException):
        raise user
    if not user["acc_type"] == "admin":
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