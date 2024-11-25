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
from pydantic import BaseModel
from typing import Optional, List

# Load environment variables from .env file
load_dotenv()

# Add this class for request validation
class ChangeUserTypeRequest(BaseModel):
    user_id: int
    user_type: Literal["manager", "agent"]
    location: str

# Add this class for email request validation
class BulkEmailRequest(BaseModel):
    subject: str
    message: str
    user_type: str
    emails: Optional[List[str]] = None

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
async def get_all_users(
    user: user_dependency,
    db: db_dependency,
    page: int = 1,
    limit: int = 10,
    userType: str = "all",
    status: str = "all"
):
    """Get all users with pagination and filters"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify user is admin
        admin = db.query(Users).filter(Users.id == user['user_id']).first()
        if not admin or admin.user_type != "admin":
            raise HTTPException(status_code=403, detail="Only admins can access this endpoint")

        # Base query
        query = db.query(Users)

        # Apply filters
        if userType != "all":
            query = query.filter(Users.user_type == userType)
        
        if status != "all":
            query = query.filter(Users.acc_status == (status == "active"))

        # Calculate total items and pages
        total_items = query.count()
        total_pages = (total_items + limit - 1) // limit

        # Apply pagination
        skip = (page - 1) * limit
        users = query.offset(skip).limit(limit).all()

        # Format response
        return {
            "users": [{
                "id": user.id,
                "fname": user.fname,
                "lname": user.lname,
                "email": user.email,
                "user_type": user.user_type,
                "acc_status": user.acc_status,
                "created_at": user.created_at,
                "account_id": user.account_id
            } for user in users],
            "total_pages": total_pages,
            "current_page": page,
            "total_items": total_items,
            "has_next": page < total_pages,
            "has_previous": page > 1
        }

    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching users: {str(e)}"
        )


@router.post("/send-emails")
async def send_emails_to_users(
    db: db_dependency,
    user: user_dependency,
    request: BulkEmailRequest
):
    """Send emails to users based on type or specific email list"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify user is admin
        admin = db.query(Users).filter(Users.id == user['user_id']).first()
        if not admin or admin.user_type != "admin":
            raise HTTPException(status_code=403, detail="Only admins can send bulk emails")

        # Validate request data
        if not request.subject or not request.message:
            raise HTTPException(status_code=400, detail="Subject and message are required")

        # Get email list based on user_type if no specific emails provided
        if not request.emails:
            query = db.query(Users)
            if request.user_type != "all":
                query = query.filter(Users.user_type == request.user_type)
            users = query.all()
            emails = [user.email for user in users if user.email]
        else:
            emails = [email for email in request.emails if email]

        if not emails:
            raise HTTPException(status_code=400, detail="No valid recipients found")

        # Create HTML message with proper validation
        message = str(request.message).strip()
        subject = str(request.subject).strip()

        if not message or not subject:
            raise HTTPException(status_code=400, detail="Message and subject cannot be empty")

        # Create HTML message directly as a string
        html_message = f"""
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0;">
                        {subject}
                    </h1>
                    <div style="color: #666666; padding: 20px 0;">
                        {message}
                    </div>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #f0f0f0; font-size: 12px; color: #999999; text-align: center;">
                        This is an automated message from Afriton. Please do not reply to this email.
                    </div>
                </div>
            </body>
        </html>
        """

        # Send emails with validated data
        try:
            print(f"Sending email to {len(emails)} recipients")
            print(f"Subject: {subject}")
            print(f"Message length: {len(html_message)}")

            # Ensure the message is properly encoded
            encoded_message = html_message.encode('utf-8').decode('utf-8')

            success = send_new_multi_email(
                Email_to_list=emails,
                Email_sub=subject,
                Email_msg=encoded_message
            )
            
            if not success:
                raise ValueError("Failed to send emails")

            return {
                "message": "Emails sent successfully!",
                "details": {
                    "recipient_count": len(emails),
                    "user_type": request.user_type,
                    "emails_sent": emails
                }
            }
        except Exception as e:
            print(f"Email sending error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send emails: {str(e)}"
            )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Email sending error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to send emails: {str(e)}"
        )
    
# change user type if your admin can change to any type or manager can user to agent only
@router.post("/change-user-type")
def change_user_type(
    user: user_dependency, 
    db: db_dependency,
    request: ChangeUserTypeRequest
):
    if isinstance(user, HTTPException):
        raise user
        
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user or (check_user.user_type not in ["admin", "manager"]):
        raise HTTPException(status_code=403, detail="Permission Denied")

    # Check if user exists
    user_to_change = db.query(Users).filter(Users.id == request.user_id).first()
    if not user_to_change:
        raise HTTPException(status_code=404, detail="User not found")

    # Convert location to lowercase for comparison
    request.location = request.location.lower().strip()

    # Manager can only create agents in their location
    if check_user.user_type == "manager":
        if request.user_type != "agent":
            raise HTTPException(status_code=403, detail="Managers can only create agents")
            
        # Get manager's worker record
        manager_worker = db.query(Workers).filter(Workers.user_id == check_user.id).first()
        if not manager_worker:
            raise HTTPException(status_code=403, detail="Manager profile not properly configured")
            
        # Convert manager's location to lowercase for comparison
        if manager_worker.location.lower().strip() != request.location:
            raise HTTPException(
                status_code=403, 
                detail=f"You can only create agents in your location: {manager_worker.location}"
            )

    # Set default allowed balance based on worker type
    allowed_balance = 5000 if request.user_type == "agent" else 100000

    # Check if user is already a worker
    existing_worker = db.query(Workers).filter(Workers.user_id == request.user_id).first()
    if existing_worker:
        raise HTTPException(status_code=400, detail="User is already a worker")

    # Create worker record
    new_worker = Workers(
        user_id=request.user_id,
        allowed_balance=allowed_balance,
        available_balance=allowed_balance,
        location=request.location,
        worker_type=request.user_type,
        managed_by=check_user.id if request.user_type == "agent" else None
    )
    
    # Update user type and activate wallet
    user_to_change.user_type = request.user_type
    user_to_change.is_wallet_active = True  # Set wallet active when changing role
    
    # Create commission wallet for the new agent/manager
    commission_wallet = Wallet(
        account_id=user_to_change.account_id,
        balance=0.0,
        wallet_type=f"{request.user_type}-wallet", #agent-wallet or manager-wallet
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
    <p>Your role has been updated to {request.user_type}.</p>
    <p>Location: {request.location}</p>
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
                "user_type": request.user_type,
                "location": request.location,
                "allowed_balance": allowed_balance,
                "wallets": [
                    {"type": f"{request.user_type}-wallet", "balance": 0.0},
                    {"type": "savings", "balance": 0.0}
                ]
            }
        }
    else:
        return {
            "message": "User type changed and wallets created but email notification failed",
            "details": {
                "user_type": request.user_type,
                "location": request.location,
                "allowed_balance": allowed_balance,
                "wallets": [
                    {"type": f"{request.user_type}-wallet", "balance": 0.0},
                    {"type": "savings", "balance": 0.0}
                ]
            }
        }
    
# Add this new endpoint
@router.get("/search-users")
async def search_users(
    db: db_dependency,
    user: user_dependency,
    search: str,
    limit: int = 10
):
    if isinstance(user, HTTPException):
        raise user
        
    # Check if requester is manager
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user or check_user.user_type != "manager":
        raise HTTPException(status_code=403, detail="Permission Denied")
    
    # Search users by email with exact and partial matches
    exact_matches = db.query(Users).filter(
        (Users.email == search) & 
        (Users.user_type == "citizen")
    ).all()
    
    partial_matches = db.query(Users).filter(
        (Users.email.ilike(f"%{search}%")) & 
        (Users.user_type == "citizen") & 
        (Users.email != search)  # Exclude exact matches
    ).limit(limit - len(exact_matches)).all()
    
    # Combine results with exact matches first
    all_matches = exact_matches + partial_matches
    
    return [{
        "id": user.id,
        "email": user.email,
        "name": user.fname,
        "match_type": "exact" if user in exact_matches else "partial"
    } for user in all_matches]
    
    
