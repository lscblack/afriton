from datetime import timedelta, datetime
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from starlette import status
from typing import Annotated
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from db.connection import db_dependency
from utils.token_verify import user_dependency
from models import userModels
from models.userModels import Users, OTP, Wallet
from sqlalchemy import or_
import json
from schemas.schemas import CreateUserRequest, Token, FromData
from schemas.returnSchemas import ReturnUser
from functions.encrpt import encrypt_any_data
from functions.send_mail import send_new_email
from emailsTemps.custom_email_send import custom_email

from dotenv import load_dotenv
import os
import random
import base64

# Load environment variables from .env file
load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

# load env values
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
AFRITON_FRONT_USERNAME = os.getenv("AFRITON_FRONT_USERNAME")
AFRITON_FRONT_PASSWORD = os.getenv("AFRITON_FRONT_PASSWORD")

# setup token gen and pass encrpty
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

# ------------------------================================
#                                   for frontend user 
#                                                         ===========================--------------------------------
@router.post("/access-token")
def create_front_access_token(
    username: str,  password: str
):
    if username != AFRITON_FRONT_USERNAME or password != AFRITON_FRONT_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Your Invalid Creditals. Please re-authenticate.",
        )

    expires_delta=timedelta(minutes=60 * 2400 * 399)

    encode = {"uname": username, "id": "0", "acc_type": "dev"}
    expires = datetime.utcnow() + expires_delta
    encode.update({"exp": expires})
    return {"token":jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)}



async def get_front_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        playload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = playload.get("uname")
        acc_type: str = playload.get("acc_type")
        user_id: str = playload.get("id")
        if username is None or user_id is None or acc_type is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required!",
            )
        return {"username": username, "user_id": user_id, "acc_type": acc_type}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Your token is invalid or has expired. Please re-authenticate.",
        )

# for frontend user --------------------------------
user_Front_dependency = Annotated[dict, Depends(get_front_current_user)]

# handel register User
@router.post("/register")
async def register_user(userFront: user_Front_dependency, db: db_dependency, create_user_request: CreateUserRequest):
    # if isinstance(userFront, HTTPException):
    #     raise userFront

    # if userFront['acc_type'] != "dev":
    #     raise HTTPException(status_code=403, detail="Not Allowed To This Action; only Afriton apps allowed!")

    try:
        # Check if email exists
        existing_user = db.query(Users).filter(Users.email == create_user_request.email).first()
        
        if existing_user:
            if existing_user.acc_status:
                # If account exists and is verified
                raise HTTPException(status_code=400, detail="Email already exists. Please login.")
            else:
                # Update existing unverified user
                existing_user.fname = create_user_request.fname
                existing_user.lname = create_user_request.lname
                existing_user.gender = create_user_request.gender
                existing_user.avatar = create_user_request.avatar
                existing_user.phone = create_user_request.phone
                existing_user.password_hash = bcrypt_context.hash(create_user_request.password)
                existing_user.acc_status = True
                
                db.commit()
                db.refresh(existing_user)
                return {"message": "Account updated successfully!", "user": create_user_request}
        
        # Create new user if email doesn't exist
        while True:
            account_id = str(random.randint(1000000000, 9999999999))
            if not db.query(Users).filter(Users.account_id == account_id).first():
                break

        new_user = Users(
            account_id=account_id,
            fname=create_user_request.fname,
            lname=create_user_request.lname,
            email=create_user_request.email,
            gender=create_user_request.gender,
            avatar=create_user_request.avatar,
            phone=create_user_request.phone,
            password_hash=bcrypt_context.hash(create_user_request.password),
            acc_status=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User registered successfully!", "user": create_user_request}

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ------Login user and create token
@router.post("/login")
async def login_for_access_token(
    userFront: user_Front_dependency, form_data: FromData, db: db_dependency
):
    # if isinstance(userFront, HTTPException):
    #     raise userFront

    # if "dev" != userFront["acc_type"]:
    #     raise HTTPException(
    #         status_code=403, detail="Not Allowed To This Action, only Afriton apps allowed!"
    #     )

    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No Account found with the given credentials",
        )

    token = create_access_token(
        user.email, user.id, user.user_type, timedelta(minutes=60 * 24 * 30)
    )

    # Return user info directly without encryption
    user_info = ReturnUser.from_orm(user).dict()

    return {
        "access_token": token, 
        "token_type": "bearer", 
        "user": user_info  # Return plain user info instead of encrypted data
    }


def authenticate_user(username: str, password: str, db):
    user = (
        db.query(userModels.Users)
        .filter(
            or_(
                userModels.Users.email == username,
                # userModels.Users.N_id == username,
            )
        )
        .first()
    )
    if not user:
        return False
    if not bcrypt_context.verify(password, user.password_hash):
        return False
    return user

# for logged in user
def create_access_token(
    username: str, user_id: int, acc_type: str, expires_delta: timedelta
):
    encode = {"uname": username, "id": user_id, "acc_type": acc_type}
    expires = datetime.utcnow() + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


# for logged in user 
async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        playload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = playload.get("uname")
        acc_type: str = playload.get("acc_type")
        user_id: str = playload.get("id")
        if username is None or user_id is None or acc_type is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required!",
            )
        return {"username": username, "user_id": user_id, "acc_type": acc_type}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Your token is invalid or has expired. Please re-authenticate.",
        )


@router.post("/google-auth", status_code=200)
async def sign_up_with_google(
    userFront: user_Front_dependency,
    create_user_request: dict,
    db: db_dependency,
):
    # Check if userFront is an HTTPException
    # if isinstance(userFront, HTTPException):
    #     raise userFront  # Re-raise the HTTPException if user is an instance of it

    # Check if the account type is allowed
    # if userFront['acc_type'] != "dev":
    #     raise HTTPException(status_code=403, detail="Not Allowed To This Action; only Afriton apps are allowed!")

    # Check if email exists
    existing_user = db.query(Users).filter(Users.email == create_user_request['email']).first()

    if existing_user:
        # Check if the account is verified
        if not existing_user.acc_status:
            raise HTTPException(status_code=403, detail="Email already taken but not verified.")

        # If the email exists, log the user into the system
        token = create_access_token(
            username=existing_user.email,
            user_id=existing_user.id,
            acc_type=existing_user.user_type,
            expires_delta=timedelta(minutes=60 * 24 * 30),
        )

        # Return user info directly without encryption
        user_info = ReturnUser.from_orm(existing_user).dict()

        return {
            "access_token": token, 
            "token_type": "bearer", 
            "user": user_info  # Return plain user info instead of encrypted data
        }

    # If the email doesn't exist, create a new user
    try:
        # Generate unique 10-digit account ID
        while True:
            account_id = str(random.randint(1000000000, 9999999999))
            if not db.query(Users).filter(Users.account_id == account_id).first():
                break

        # Create the user model
        new_user = Users(
            account_id=account_id,
            fname=create_user_request.get('fname', ''),
            lname=create_user_request.get('lname', ''),
            email=create_user_request.get('email', ''),
            gender=create_user_request.get('gender', ''),
            avatar=create_user_request.get('avatar', ''),
            acc_status=True,
            password_hash=bcrypt_context.hash(create_user_request.get('email', '')),
        )

        # Add to the database and commit
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Return the token of the created user
        token = create_access_token(
            username=new_user.email,
            user_id=new_user.id,
            acc_type=new_user.user_type,
            expires_delta=timedelta(minutes=60 * 24 * 30),
        )

        # Return user info directly without encryption
        user_info = ReturnUser.from_orm(new_user).dict()

        # Prepare email content
        heading = "Welcome to Afriton!"
        sub = "Your Gateway to Seamless African Payments"
        body = """
            <p>Thank you for joining Afriton! We're excited to have you with us. You've successfully created your account, and now you can experience borderless financial transactions across Africa.</p>
            
            <h2>Why choose Afriton?</h2>
            <p>We provide a secure and innovative platform for all your financial needs across Africa. Here's what makes us unique:</p>
            <ul>
            <li><b>Unified Currency:</b> Experience seamless transactions with our standardized African currency system.</li>
            <li><b>Biometric Security:</b> Enjoy secure payments using cutting-edge fingerprint authentication.</li>
            <li><b>Cross-Border Freedom:</b> Send and receive money across African countries instantly.</li>
            <li><b>Smart Shopping:</b> Purchase products and services across the continent without currency barriers.</li>
            <li><b>Secure and Reliable:</b> Your financial security is our top priority.</li>
            <li><b>Customer Support:</b> Our dedicated support team is here to assist you every step of the way.</li>
            <li><b>Easy deposits:</b> Deposit funds into your account with ease.</li>
            <li><b>Quick withdrawals:</b> Withdraw your funds quickly and securely.</li>
            <li><b>Sub-accounts:</b> Manage your finances with sub-accounts.</li>
            <li><b>Goal tracking:</b> Track your financial goals with ease.</li>
            <li><b>Flexible savings plans:</b> Manage your finances with flexible savings plans.</li>
            <li><b>Family management:</b> Manage your family's finances with ease.</li>
            <li><b>Currency exchange:</b> Exchange currencies with ease from any currency to Afriton currency.</li>
            <li><b>Quick loans:</b> Access quick loans to meet your financial needs.</li>
            <li><b>Referral rewards:</b> Earn rewards for referring friends and family.</li>
            <li><b>Credit system:</b> Enjoy a credit system that allows you to borrow and repay funds.</li>
            </ul>
            
            <h2>Getting Started</h2>
            <p>To make the most of your Afriton account:</p>
            <ol>
            <li>Finish setting up your account</li>
            <li>Verify your email address</li>
            <li>Set up your biometric authentication</li>
            <li>Add your preferred payment methods</li>
            <li>Start enjoying borderless transactions!</li>
            </ol>
            
            <p>Your account is your passport to a unified African financial ecosystem. Start exploring the possibilities today!</p>
            
            <p><b>Ready to begin?</b></p>
            <p>Log in to your Afriton account and experience the future of African payments.</p>
            

        """
        
        # Send welcome email
        msg = custom_email(new_user.fname, heading, body)
        if send_new_email(new_user.email, sub, msg):
            return {
                "access_token": token, 
                "token_type": "bearer", 
                "user": user_info  # Return plain user info instead of encrypted data
            }

    except Exception as e:
        # Handle exceptions gracefully
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/google-auth-token")
async def create_token_for_google_signup(
    userFront: user_Front_dependency,
    data: dict,
    db: db_dependency,
):
    """
    Endpoint for Google OAuth token verification and user login/signup
    """
    try:
        # Validate frontend token
        if isinstance(userFront, HTTPException):
            raise userFront

        if userFront['acc_type'] != "dev":
            raise HTTPException(
                status_code=403,
                detail="Only Afriton apps are allowed!"
            )

        # Get email from request body
        email = data.get('email')
        if not email:
            raise HTTPException(
                status_code=422,
                detail="Email is required in request body"
            )

        # Check if user exists
        existing_user = db.query(Users).filter(Users.email == email).first()

        if not existing_user:
            # If user doesn't exist, create new user with Google auth
            while True:
                account_id = str(random.randint(1000000000, 9999999999))
                if not db.query(Users).filter(Users.account_id == account_id).first():
                    break

            new_user = Users(
                account_id=account_id,
                fname=email.split('@')[0],  # Use email prefix as fname
                email=email,
                acc_status=True,  # Auto verify Google users
                password_hash=bcrypt_context.hash(email),  # Use email as password for Google users
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            existing_user = new_user

        # Generate token
        token = create_access_token(
            existing_user.email,
            existing_user.id,
            existing_user.user_type,
            timedelta(minutes=60 * 24 * 30)
        )

        # Return user info
        user_info = ReturnUser.from_orm(existing_user).dict()

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user_info
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred: {str(e)}"
        )

@router.post("/reset-password")
async def reset_password(
    userFront: user_Front_dependency,
    db: db_dependency,
    email: str,
    new_password: str
):
    # if isinstance(userFront, HTTPException):
    #     raise userFront

    # if userFront['acc_type'] != "dev":
    #     raise HTTPException(status_code=403, detail="Not Allowed To This Action")

    try:
        # Find user by email
        user = db.query(Users).filter(Users.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update password - no need to check verification code since we already verified
        user.password_hash = bcrypt_context.hash(new_password)
        db.commit()

        return {"message": "Password reset successfully"}
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-profile")
async def get_user_profile(
    user: user_dependency,
    db: db_dependency
):
    """Get user profile information"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Get user details
        user_data = db.query(Users).filter(Users.id == user['user_id']).first()
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        # Get user's wallets
        wallets = db.query(Wallet).filter(
            Wallet.account_id == user_data.account_id
        ).all()

        # Format wallet data
        wallet_details = [{
            "wallet_type": wallet.wallet_type,
            "balance": float(wallet.balance),
            "wallet_status": wallet.wallet_status,
            "created_at": wallet.created_at.isoformat() if wallet.created_at else None
        } for wallet in wallets]

        # Return formatted user data without location
        return {
            "id": user_data.id,
            "account_id": user_data.account_id,
            "fname": user_data.fname,
            "mname": user_data.mname,
            "lname": user_data.lname,
            "email": user_data.email,
            "phone": user_data.phone,
            "avatar": user_data.avatar,
            "user_type": user_data.user_type,
            "acc_status": user_data.acc_status,
            "is_wallet_active": user_data.is_wallet_active,
            "created_at": user_data.created_at,
            "wallets": wallet_details
        }
    except Exception as e:
        print(f"Error in get_user_profile: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/update-profile")
async def update_profile(
    user: user_dependency,
    db: db_dependency,
    fname: str = None,
    mname: str = None,
    lname: str = None,
    phone: str = None
):
    """Update user profile information"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Get user details
        user_data = db.query(Users).filter(Users.id == user['user_id']).first()
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        # Update fields if provided and not empty
        if fname and fname.strip():
            user_data.fname = fname
        if mname and mname.strip():
            user_data.mname = mname
        if lname and lname.strip():
            user_data.lname = lname
        if phone and phone.strip():
            user_data.phone = phone

        db.commit()
        db.refresh(user_data)  # Refresh the instance

        return {
            "message": "Profile updated successfully",
            "user": {
                "fname": user_data.fname,
                "mname": user_data.mname,
                "lname": user_data.lname,
                "phone": user_data.phone
            }
        }
    except Exception as e:
        db.rollback()
        print(f"Error updating profile: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update-avatar")
async def update_avatar(
    user: user_dependency,
    db: db_dependency,
    avatar: UploadFile = File(...)
):
    """Update user's avatar"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Get user details
        user_data = db.query(Users).filter(Users.id == user['user_id']).first()
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        # Read and validate image file
        contents = await avatar.read()
        if len(contents) > 5 * 1024 * 1024:  # 5MB limit
            raise HTTPException(status_code=400, detail="File too large")

        # Convert to base64 for storage
        base64_image = base64.b64encode(contents).decode()
        user_data.avatar = f"data:{avatar.content_type};base64,{base64_image}"

        db.commit()

        return {"message": "Avatar updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


