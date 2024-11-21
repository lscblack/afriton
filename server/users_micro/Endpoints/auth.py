from datetime import timedelta, datetime
from fastapi import APIRouter, HTTPException, Depends
from starlette import status
from typing import Annotated
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from db.connection import db_dependency
from models import userModels
from models.userModels import Users, OTP
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

    expires_delta=timedelta(minutes=60 * 24 * 30)

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
    if isinstance(userFront, HTTPException):
        raise userFront

    if userFront['acc_type'] != "dev":
        raise HTTPException(status_code=403, detail="Not Allowed To This Action; only Afriton apps allowed!")

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
    if isinstance(userFront, HTTPException):
        raise userFront

    if "dev" != userFront["acc_type"]:
        raise HTTPException(
            status_code=403, detail="Not Allowed To This Action, only Afriton apps allowed!"
        )

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
    if isinstance(userFront, HTTPException):
        raise userFront  # Re-raise the HTTPException if user is an instance of it

    # Check if the account type is allowed
    if userFront['acc_type'] != "dev":
        raise HTTPException(status_code=403, detail="Not Allowed To This Action; only Afriton apps are allowed!")

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
            password_hash=bcrypt_context.hash(create_user_request.get('password', f'Google_{datetime.now().timestamp()}')),
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
        msg = custom_email(user_info.fname, heading, body)
        if send_new_email(user_info.email, sub, msg):
            return {
                "access_token": token, 
                "token_type": "bearer", 
                "user": user_info  # Return plain user info instead of encrypted data
            }

    except Exception as e:
        # Handle exceptions gracefully
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/google-auth-token", status_code=200)
async def create_token_for_google_signup(
    userFront: user_Front_dependency,
    Email: str,
    db: db_dependency,
):
    # Raise HTTPException if user is not authenticated correctly
    if isinstance(userFront, HTTPException):
        raise userFront  

    # Only allow access for specific app types
    if userFront['acc_type'] != "dev":
        raise HTTPException(status_code=403, detail="Only Afriton apps are allowed!")

    # Check if email already exists and account status is active
    existing_user = db.query(Users).filter(Users.email == Email).first()

    # If no account is found with the provided email, return a 404 error
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with the given credentials",
        )
    # If no account is found with the provided email, return a 404 error
    if not existing_user.acc_status:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email Not Verified",
        )

    # Generate an access token with a 30-day expiration time
    token = create_access_token(
        existing_user.email,
        existing_user.id,
        existing_user.user_type,
        timedelta(minutes=60 * 24 * 30),
    )

    # Return user info directly without encryption
    user_info = ReturnUser.from_orm(existing_user).dict()

    # Return token and encrypted user data
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_info,  # Return plain user info instead of encrypted data
    }

@router.post("/reset-password")
async def reset_password(
    userFront: user_Front_dependency,
    db: db_dependency,
    email: str,
    new_password: str
):
    if isinstance(userFront, HTTPException):
        raise userFront

    if userFront['acc_type'] != "dev":
        raise HTTPException(status_code=403, detail="Not Allowed To This Action")

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

