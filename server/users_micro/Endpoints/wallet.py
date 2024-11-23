from fastapi import APIRouter, HTTPException,status
from db.VerifyToken import user_Front_dependency,user_dependency
from dotenv import load_dotenv
import random
from db.connection import db_dependency
from models.userModels import Users, OTP, Wallet,Withdrawal_request,Transaction_history,Workers, Profit
from typing import Literal
from functions.send_mail import send_new_email
from functions.send_mulltiple import send_new_multi_email
from emailsTemps.custom_email_send import custom_email
from schemas.emailSchemas import EmailSchema, OtpVerify
from datetime import datetime,timedelta
from Endpoints.conversionRate import convert_to_afriton, convert_from_afriton
from sqlalchemy.orm import Session

# Load environment variables from .env file
load_dotenv()

router = APIRouter(prefix="/wallet", tags=["Wallet"])

# ------------------------================================
#                                   for Updating is_wallet_active
#                                                         ===========================--------------------------------
@router.post("/update-wallet-status")
async def update_wallet_status(
    user: user_dependency,
    db: db_dependency,
    wallet_type: Literal["savings", "goal", "business", "family", "emergency"]
):
    if isinstance(user, HTTPException):
        raise user

    # Check if user exists and wallet is inactive
    check_user = db.query(Users).filter(
        Users.id == user['user_id']
    ).first()

    # If user not found or wallet already active
    if not check_user:
        raise HTTPException(status_code=404, detail="User not found or wallet already active")

    # Update is_wallet_active
    check_user.is_wallet_active = True

    # Create wallet if it does not exist
    existing_wallet = db.query(Wallet).filter(
        Wallet.account_id == check_user.account_id, Wallet.wallet_type == wallet_type
    ).first()

    if not existing_wallet:
        new_wallet = Wallet(
            account_id=check_user.account_id,
            balance=0.0,
            wallet_status=True,
            wallet_type=wallet_type
        )
        db.add(new_wallet)

    # Commit changes to the database
    db.commit()

    # Prepare email content
    heading = "Welcome to Afriton!"
    sub = "Your Gateway to Seamless African Payments"
    body = f"""
    <p>Hi {check_user.fname},</p>
    <p>Your wallet has been activated successfully.</p>
    <p>You can now start enjoying borderless transactions across Africa.</p>
    <p>Start exploring the possibilities today!</p>
    """

    # Send welcome email
    msg = custom_email(check_user.fname, heading, body)
    if send_new_email(check_user.email, sub, msg):
        return {"message": "Wallet status updated successfully"}
    else:
        raise HTTPException(status_code=200, detail="Updated but unable to send email")

# ------------------------================================
#                                   for Creating Wallet
#                                                         ===========================--------------------------------
@router.post("/get-wallet-details")
def get_wallet_details(user: user_dependency, db: db_dependency):
    """Get wallet details for the authenticated user"""
    if isinstance(user, HTTPException):
        raise user

    # Get user details
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Define available wallet types based on user type
    available_wallet_types = {
        "citizen": ["savings", "goal", "business", "family", "emergency"],
        "agent": ["savings", "agent-wallet"],
        "manager": ["savings", "manager-wallet"],
        "admin": ["savings"]  # Admin only has savings wallet
    }

    # Get allowed wallet types for this user
    allowed_types = available_wallet_types.get(check_user.user_type, ["savings"])

    # Get existing wallets
    wallet_details = db.query(Wallet).filter(
        Wallet.account_id == check_user.account_id,
        Wallet.wallet_type.in_(allowed_types)
    ).all()

    # Create a dictionary of existing wallets
    existing_wallets = {w.wallet_type: w for w in wallet_details}

    # Prepare response with all allowed wallet types
    response_wallets = []
    for wallet_type in allowed_types:
        if wallet_type in existing_wallets:
            # Use existing wallet data
            wallet = existing_wallets[wallet_type]
            response_wallets.append({
                "id": wallet.id,
                "account_id": wallet.account_id,
                "balance": wallet.balance,
                "wallet_type": wallet_type,
                "wallet_status": wallet.wallet_status,
                "created_at": wallet.created_at,
                "exists": True
            })
        else:
            # Include non-existent wallet type with default values
            response_wallets.append({
                "wallet_type": wallet_type,
                "balance": 0.0,
                "wallet_status": False,
                "exists": False
            })

    # Add wallet type descriptions
    wallet_descriptions = {
        "savings": "Your primary savings account for daily transactions",
        "goal": "Set and track your financial goals",
        "business": "Manage your business finances",
        "family": "Share and manage family expenses",
        "emergency": "Keep funds for unexpected expenses",
        "agent-wallet": "Earn commissions from transactions",
        "manager-wallet": "Manage agent networks and earn commissions"
    }

    return {
        "message": "Wallet details retrieved successfully",
        "user_type": check_user.user_type,
        "wallet_details": [{
            **wallet,
            "description": wallet_descriptions.get(wallet["wallet_type"], "")
        } for wallet in response_wallets]
    }

#admin can see all wallets of user
@router.get("/admin-view-wallets")
async def admin_view_wallets(user: user_dependency, db: db_dependency):
    if isinstance(user, HTTPException):
        raise user
    #check if user is admin from database
    check_user = db.query(Users).filter(Users.id == user['user_id'] , Users.user_type == "admin").first()
    if not check_user:
        raise HTTPException(status_code=403, detail="User not authorized")
    #get all wallets
    wallets = db.query(Wallet).all()
    if not wallets:
        raise HTTPException(status_code=404, detail="No wallets found")
    return {"message": "Wallets retrieved successfully", "wallets": wallets}
    
@router.post("/create-withdrawal-request")
async def create_withdrawal_request(
    user: user_dependency,
    db: db_dependency,
    amount: float,
    account_id: str,
    withdrawal_currency: str,
    wallet_type: Literal["savings", "goal", "business", "family", "emergency", "agent-wallet", "manager-wallet"]
):
    """Create a withdrawal request with currency conversion"""
    if isinstance(user, HTTPException):
        raise user

    # Verify the user making the request is an agent or manager
    requester = db.query(Users).filter(
        Users.id == user['user_id'],
        Users.user_type.in_(["agent", "manager"])
    ).first()
    if not requester:
        raise HTTPException(status_code=403, detail="Only agents or managers can create withdrawal requests")

    # Get user details for the account requesting withdrawal
    check_user = db.query(Users).filter(Users.account_id == account_id).first()
    if not check_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get wallet
    wallet = db.query(Wallet).filter(
        Wallet.account_id == account_id,
        Wallet.wallet_type == wallet_type
    ).first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    # Calculate fees (5% total)
    total_fee_afriton = amount * 0.05
    agent_commission = amount * 0.03
    afriton_commission = amount * 0.02

    # Total amount needed (withdrawal amount + fees)
    total_amount_needed = amount + total_fee_afriton

    # Check if wallet has sufficient balance for amount + fees
    if total_amount_needed > wallet.balance:
        raise HTTPException(status_code=400, detail=f"Insufficient balance. Need {total_amount_needed} Afriton (including 5% fees)")

    if amount < 1:  # Minimum withdrawal amount
        raise HTTPException(status_code=400, detail="Minimum withdrawal amount is 1 Afriton")
    
    # Convert amounts to withdrawal currency
    try:
        withdrawal_amount = convert_from_afriton(amount, withdrawal_currency, db)  # Full amount user will receive
        fee_in_withdrawal_currency = convert_from_afriton(total_fee_afriton, withdrawal_currency, db)
    except HTTPException as e:
        raise e

    # Distribute fees and commissions
    fee_distribution = await distribute_fees(
        db=db,
        amount=amount,
        agent_id=user['user_id'],
        fee_type="withdrawal"
    )

    # Create withdrawal request with fee breakdown
    withdrawal = Withdrawal_request(
        account_id=account_id,
        amount=amount,  # Base amount in Afriton
        withdrawal_amount=withdrawal_amount,  # Amount in withdrawal currency
        withdrawal_currency=withdrawal_currency,
        wallet_type=wallet_type,
        status="Pending",
        request_to="agent",
        total_amount=total_amount_needed,  # Total including fees in Afriton
        charges=total_fee_afriton,  # Fees in Afriton
        done_by=str(user['user_id']),  # Add the done_by field
        agent_commission=fee_distribution["breakdown"]["agent_commission"],
        manager_commission=fee_distribution["breakdown"]["manager_commission"],
        platform_profit=fee_distribution["breakdown"]["system_profit"]
    )
    db.add(withdrawal)
    db.commit()

    # Send notification email
    heading = "Withdrawal Request Submitted"
    sub = "New Withdrawal Request"
    body = f"""
    <p>Hi {check_user.fname},</p>
    <p>A withdrawal request has been submitted on your behalf:</p>
    <ul>
        <li>Amount to Receive: {withdrawal_amount} {withdrawal_currency}</li>
        <li>Amount in Afriton: {amount} AFT</li>
        <li>Service Fee (5%): {fee_in_withdrawal_currency} {withdrawal_currency}</li>
        <li>Total Deduction from Wallet: {total_amount_needed} AFT</li>
        <li>Status: Pending</li>
    </ul>
    <p>Fee Breakdown:</p>
    <ul>
        <li>Agent Commission (3%): {convert_from_afriton(agent_commission, withdrawal_currency, db)} {withdrawal_currency}</li>
        <li>Platform Fee (2%): {convert_from_afriton(afriton_commission, withdrawal_currency, db)} {withdrawal_currency}</li>
    </ul>
    <p>You will be notified once your request is processed.</p>
    """
    msg = custom_email(check_user.fname, heading, body)
    send_new_email(check_user.email, sub, msg)

    return {
        "message": "Withdrawal request submitted successfully",
        "request_details": {
            "amount_to_receive": withdrawal_amount,
            "withdrawal_currency": withdrawal_currency,
            "amount_afriton": amount,
            "service_fee_afriton": total_fee_afriton,
            "total_deduction": total_amount_needed,
            "fee_breakdown": {
                "agent_commission": convert_from_afriton(agent_commission, withdrawal_currency, db),
                "platform_fee": convert_from_afriton(afriton_commission, withdrawal_currency, db)
            },
            "status": "Pending"
        }
    }

@router.post("/respond-withdrawal-request/{request_id}")
async def respond_withdrawal_request(
    request_id: int,
    user: user_dependency,
    db: db_dependency,
    action: Literal["Approve", "Reject"]
):
    if isinstance(user, HTTPException):
        raise user

    # Get user's account_id from Users table
    user_data = db.query(Users).filter(Users.id == user['user_id']).first()
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate user and fetch the withdrawal request
    request = db.query(Withdrawal_request).filter(
        Withdrawal_request.id == request_id,
        Withdrawal_request.status == "Pending"
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Withdrawal request not found or already processed")

    wallet = db.query(Wallet).filter(
        Wallet.account_id == request.account_id,
        Wallet.wallet_type == request.wallet_type
    ).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    if action == "Approve":
        # Check minimum withdrawal amount
        if request.amount < 1:
            raise HTTPException(status_code=400, detail="Minimum withdrawal amount is 1 Afriton")

        # Check if balance is sufficient to cover amount + charges
        if wallet.balance < request.total_amount:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient balance. Total required (including charges): {request.total_amount} Afriton"
            )

        # Deduct balance and create transaction history
        wallet.balance -= request.total_amount
        transaction = Transaction_history(
            account_id=wallet.account_id,
            amount=-request.total_amount,  # Record total deduction including charges
            transaction_type="withdrawal",
            wallet_type=request.wallet_type,
            done_by=str(user['user_id'])
        )
        db.add(transaction)
        request.status = "Approved"
        request.processed_at = datetime.utcnow()

        # Convert remaining balance to withdrawal currency for email
        try:
            remaining_balance_foreign = convert_from_afriton(wallet.balance - request.total_amount, 
                                                          request.withdrawal_currency, 
                                                          db)
        except HTTPException as e:
            raise e

        # Email notifications
        heading = "Withdrawal Request Update"
        sub = f"Withdrawal Request {action}ed"
        
        # Get user details for email
        user_details = db.query(Users).filter(Users.account_id == request.account_id).first()
        
        user_body = f"""
        <p>Hi {user_details.fname},</p>
        <p>Your withdrawal request has been {action.lower()}ed.</p>
        <p>Details:</p>
        <ul>
            <li>Amount to Receive: {request.withdrawal_amount} {request.withdrawal_currency}</li>
            <li>Amount in Afriton: {request.amount} AFT</li>
            <li>Service Fee: {request.charges} AFT ({convert_from_afriton(request.charges, request.withdrawal_currency, db)} {request.withdrawal_currency})</li>
            <li>Total Deducted: {request.total_amount} AFT ({convert_from_afriton(request.total_amount, request.withdrawal_currency, db)} {request.withdrawal_currency})</li>
        </ul>
        <p>Remaining Balance:</p>
        <ul>
            <li>In Afriton: {wallet.balance - request.total_amount} AFT</li>
            <li>In {request.withdrawal_currency}: {remaining_balance_foreign} {request.withdrawal_currency}</li>
        </ul>
        """
    else:
        user_body = f"""
        <p>Hi {user_details.fname},</p>
        <p>Your withdrawal request has been rejected.</p>
        <p>Details of rejected request:</p>
        <ul>
            <li>Amount Requested: {request.withdrawal_amount} {request.withdrawal_currency}</li>
            <li>Amount in Afriton: {request.amount} AFT</li>
            <li>Wallet Type: {request.wallet_type}</li>
        </ul>
        <p>Your wallet balance remains unchanged:</p>
        <ul>
            <li>In Afriton: {wallet.balance} AFT</li>
            <li>In {request.withdrawal_currency}: {convert_from_afriton(wallet.balance, request.withdrawal_currency, db)} {request.withdrawal_currency}</li>
        </ul>
        """

    # Send email to user
    send_new_email(user_details.email, sub, custom_email(user_details.fname, heading, user_body))

    return {
        "message": f"Withdrawal request {action.lower()}ed successfully",
        "status": action,
        "details": {
            "base_amount": {
                "afriton": request.amount,
                "foreign": {
                    "amount": request.withdrawal_amount,
                    "currency": request.withdrawal_currency
                }
            },
            "fees": {
                "total": {
                    "afriton": request.charges,
                    "foreign": {
                        "amount": convert_from_afriton(request.charges, request.withdrawal_currency, db),
                        "currency": request.withdrawal_currency
                    }
                },
                "breakdown": {
                    "agent_commission": {
                        "afriton": request.charges * 0.6,
                        "foreign": {
                            "amount": convert_from_afriton(request.charges * 0.6, request.withdrawal_currency, db),
                            "currency": request.withdrawal_currency
                        }
                    },
                    "platform_fee": {
                        "afriton": request.charges * 0.4,
                        "foreign": {
                            "amount": convert_from_afriton(request.charges * 0.4, request.withdrawal_currency, db),
                            "currency": request.withdrawal_currency
                        }
                    }
                }
            },
            "total_deducted": {
                "afriton": request.total_amount,
                "foreign": {
                    "amount": convert_from_afriton(request.total_amount, request.withdrawal_currency, db),
                    "currency": request.withdrawal_currency
                }
            },
            "remaining_balance": {
                "afriton": wallet.balance - request.total_amount if action == "Approve" else wallet.balance,
                "foreign": {
                    "amount": remaining_balance_foreign if action == "Approve" else convert_from_afriton(wallet.balance, request.withdrawal_currency, db),
                    "currency": request.withdrawal_currency
                }
            },
            "wallet_type": request.wallet_type,
            "processed_at": request.processed_at
        }
    }

# deposit money to wallet
# Endpoint for initiating a deposit request
@router.post("/create-deposit-request")
async def create_deposit_request(
    user: user_dependency,
    db: db_dependency,
    account_id: str,
    amount: float,
    currency: str,
    wallet_type: Literal["savings", "goal", "business", "family", "emergency"]
):
    if isinstance(user, HTTPException):
        raise user

    # Convert amount to Afriton
    try:
        afriton_amount = convert_to_afriton(amount, currency, db)
    except HTTPException as e:
        raise e

    # Verify that the requester is an agent or manager
    requester = db.query(Users).filter(
        Users.id == user['user_id'],
        Users.user_type.in_(["agent", "manager"])
    ).first()

    if not requester:
        raise HTTPException(status_code=403, detail="Only agents or managers can initiate deposit requests")

    # Check worker's available balance
    worker = db.query(Workers).filter(Workers.user_id == user['user_id']).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker record not found")

    if afriton_amount > worker.available_balance:
        raise HTTPException(status_code=400, detail="Insufficient available balance for deposit")

    # Check if the target user exists
    target_user = db.query(Users).filter(Users.account_id == account_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate the deposit amount
    if afriton_amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    # Check and retrieve wallet
    wallet = db.query(Wallet).filter(
        Wallet.account_id == account_id,
        Wallet.wallet_type == wallet_type
    ).first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    # Update the wallet balance with Afriton amount
    wallet.balance += afriton_amount

    # Create transaction history with updated fields
    transaction = Transaction_history(
        account_id=account_id,
        amount=afriton_amount,
        original_amount=amount,
        original_currency=currency,
        transaction_type="deposit",
        wallet_type=wallet_type,
        done_by=str(user['user_id'])  # Convert user_id to string
    )
    db.add(transaction)

    # Update worker's available balance
    worker.available_balance -= afriton_amount

    # Commit the changes
    db.commit()

    # Send notification email to the user
    heading = "Deposit Confirmation"
    sub = "Deposit Successfully Processed"
    user_body = f"""
    <p>Hi {target_user.fname},</p>
    <p>A deposit has been successfully processed:</p>
    <ul>
        <li>Original Amount: {amount} {currency}</li>
        <li>Converted Amount: {afriton_amount} Afriton</li>
        <li>Wallet Type: {wallet_type}</li>
    </ul>
    <p>Your new balance is: {wallet.balance} Afriton</p>
    """
    user_msg = custom_email(target_user.fname, heading, user_body)
    send_new_email(target_user.email, sub, user_msg)

    return {
        "message": "Deposit successfully created",
        "details": {
            "account_id": account_id,
            "amount": amount,
            "currency": currency,
            "converted_amount": afriton_amount,
            "wallet_type": wallet_type,
            "new_balance": wallet.balance,
        }
    }

@router.get("/commission-balance")
async def get_commission_balance(
    user: user_dependency,
    db: db_dependency
):
    """Get agent or manager commission wallet balance"""
    if isinstance(user, HTTPException):
        raise user

    # Check if user is agent or manager
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user or check_user.user_type not in ["agent", "manager"]:
        raise HTTPException(status_code=403, detail="Only agents and managers can access commission balance")

    # Get wallet type based on user type
    wallet_type = f"{check_user.user_type}-wallet"
    
    # Get commission wallet
    wallet = db.query(Wallet).filter(
        Wallet.account_id == check_user.account_id,
        Wallet.wallet_type == wallet_type
    ).first()

    if not wallet:
        # Create commission wallet if it doesn't exist
        wallet = Wallet(
            account_id=check_user.account_id,
            balance=0.0,
            wallet_type=wallet_type
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    return {
        "balance": wallet.balance,
        "wallet_type": wallet_type,
        "user_type": check_user.user_type
    }

@router.post("/withdraw-commission")
async def withdraw_commission(
    user: user_dependency,
    db: db_dependency,
    amount: float,
    currency: str
):
    """Request commission withdrawal for agents/managers"""
    if isinstance(user, HTTPException):
        raise user

    # Check if user is agent or manager
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user or check_user.user_type not in ["agent", "manager"]:
        raise HTTPException(status_code=403, detail="Only agents and managers can withdraw commission")

    # Get wallet type based on user type
    wallet_type = f"{check_user.user_type}-wallet"
    
    # Get commission wallet
    wallet = db.query(Wallet).filter(
        Wallet.account_id == check_user.account_id,
        Wallet.wallet_type == wallet_type
    ).first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Commission wallet not found")

    # Convert withdrawal amount to Afriton
    try:
        afriton_amount = convert_to_afriton(amount, currency, db)
    except HTTPException as e:
        raise e

    if afriton_amount > wallet.balance:
        raise HTTPException(status_code=400, detail="Insufficient commission balance")

    if afriton_amount < 5:  # Minimum withdrawal amount is 5 Afriton
        raise HTTPException(status_code=400, detail="Minimum withdrawal amount is 5 Afriton")

    # Create withdrawal request
    request_to = "admin" if check_user.user_type == "manager" else "manager"
    
    withdrawal = Withdrawal_request(
        account_id=check_user.account_id,
        amount=amount,
        currency=currency,
        converted_amount=afriton_amount,
        status="Pending",
        request_to=request_to,
        wallet_type=wallet_type
    )
    db.add(withdrawal)
    db.commit()

    # Send notification email
    heading = "Commission Withdrawal Request"
    sub = "New Commission Withdrawal Request"
    body = f"""
    <p>Hi {check_user.fname},</p>
    <p>Your commission withdrawal request has been submitted:</p>
    <ul>
        <li>Amount: {amount} {currency}</li>
        <li>Converted Amount: {afriton_amount} Afriton</li>
        <li>Status: Pending</li>
    </ul>
    <p>You will be notified once your request is processed.</p>
    """
    msg = custom_email(check_user.fname, heading, body)
    send_new_email(check_user.email, sub, msg)

    return {
        "message": "Withdrawal request submitted successfully",
        "request_details": {
            "amount": amount,
            "currency": currency,
            "converted_amount": afriton_amount,
            "status": "Pending"
        }
    }

# Update the change_user_type function to create commission wallet
@router.post("/change-user-type")
async def change_user_type(
    user: user_dependency, 
    db: db_dependency,
    user_type: Literal["admin", "manager", "agent"],
    user_id: int,
    location: str
):
    # ... existing validation code ...

    # Create commission wallet for new agent/manager
    if user_type in ["agent", "manager"]:
        wallet = Wallet(
            account_id=user_to_change.account_id,
            balance=0.0,
            wallet_type=f"{user_type}-wallet"
        )
        db.add(wallet)

    # ... rest of the existing code ...

@router.post("/transfer")
async def transfer_money(
    user: user_dependency,
    db: db_dependency,
    recipient_account_id: str,
    amount: float,
    currency: str,
    from_wallet_type: Literal["savings", "goal", "business", "family", "emergency"]
):
    """Transfer money to another Afriton user"""
    if isinstance(user, HTTPException):
        raise user

    # Get sender details
    sender = db.query(Users).filter(Users.id == user['user_id']).first()
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    # Get recipient details
    recipient = db.query(Users).filter(
        Users.account_id == recipient_account_id,
        Users.acc_status == True,  # Ensure recipient account is verified
        Users.is_wallet_active == True  # Ensure recipient wallet is active
    ).first()
    if not recipient:
        raise HTTPException(
            status_code=404, 
            detail="Recipient not found or account not activated"
        )

    # Convert amount to Afriton
    try:
        afriton_amount = convert_to_afriton(amount, currency, db)
    except HTTPException as e:
        raise e

    # Get sender's wallet
    sender_wallet = db.query(Wallet).filter(
        Wallet.account_id == sender.account_id,
        Wallet.wallet_type == from_wallet_type
    ).first()
    if not sender_wallet:
        raise HTTPException(status_code=404, detail="Sender wallet not found")

    # Check sufficient balance
    if sender_wallet.balance < afriton_amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Get recipient's savings wallet (default wallet for receiving transfers)
    recipient_wallet = db.query(Wallet).filter(
        Wallet.account_id == recipient_account_id,
        Wallet.wallet_type == "savings"
    ).first()
    if not recipient_wallet:
        raise HTTPException(status_code=404, detail="Recipient wallet not found")

    # Perform transfer
    sender_wallet.balance -= afriton_amount
    recipient_wallet.balance += afriton_amount

    # Create transaction history for sender
    sender_transaction = Transaction_history(
        account_id=sender.account_id,
        amount=-afriton_amount,
        original_amount=-amount,
        original_currency=currency,
        transaction_type="transfer_sent",
        wallet_type=from_wallet_type,
        done_by=str(user['user_id'])
    )

    # Create transaction history for recipient
    recipient_transaction = Transaction_history(
        account_id=recipient_account_id,
        amount=afriton_amount,
        original_amount=amount,
        original_currency=currency,
        transaction_type="transfer_received",
        wallet_type="savings",
        done_by=str(user['user_id'])
    )

    db.add(sender_transaction)
    db.add(recipient_transaction)
    db.commit()

    # Send email notifications
    # To sender
    sender_body = f"""
    <p>Hi {sender.fname},</p>
    <p>Your transfer has been completed successfully:</p>
    <ul>
        <li>Amount Sent: {amount} {currency}</li>
        <li>Converted Amount: {afriton_amount} Afriton</li>
        <li>Recipient: {recipient.fname} {recipient.lname}</li>
        <li>From Wallet: {from_wallet_type}</li>
    </ul>
    <p>Your new balance is: {sender_wallet.balance} Afriton</p>
    """
    send_new_email(
        sender.email,
        "Transfer Confirmation",
        custom_email(sender.fname, "Transfer Sent", sender_body)
    )

    # To recipient
    recipient_body = f"""
    <p>Hi {recipient.fname},</p>
    <p>You have received a transfer:</p>
    <ul>
        <li>Amount: {amount} {currency}</li>
        <li>Converted Amount: {afriton_amount} Afriton</li>
        <li>From: {sender.fname} {sender.lname}</li>
        <li>To Wallet: savings</li>
    </ul>
    <p>Your new balance is: {recipient_wallet.balance} Afriton</p>
    """
    send_new_email(
        recipient.email,
        "Transfer Received",
        custom_email(recipient.fname, "Transfer Received", recipient_body)
    )

    return {
        "message": "Transfer completed successfully",
        "details": {
            "amount": amount,
            "currency": currency,
            "converted_amount": afriton_amount,
            "recipient": recipient.fname,
            "from_wallet": from_wallet_type,
            "new_balance": sender_wallet.balance
        }
    }

@router.get("/my-withdrawal-requests")
async def get_my_withdrawal_requests(
    user: user_dependency,
    db: db_dependency,
    skip: int = 0,
    limit: int = 100
):
    """Get all withdrawal requests for the authenticated user"""
    if isinstance(user, HTTPException):
        raise user

    # Get user details
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all withdrawal requests for this user
    requests = db.query(Withdrawal_request).filter(
        Withdrawal_request.account_id == check_user.account_id
    ).order_by(
        Withdrawal_request.created_at.desc()
    ).offset(skip).limit(limit).all()

    return {
        "message": "Withdrawal requests retrieved successfully",
        "total_requests": len(requests),
        "requests": [{
            "id": req.id,
            "amount": req.amount,
            "withdrawal_amount": req.withdrawal_amount,
            "withdrawal_currency": req.withdrawal_currency,
            "wallet_type": req.wallet_type,
            "status": req.status,
            "charges": req.charges,
            "total_amount": req.total_amount,
            "created_at": req.created_at,
            "processed_at": req.processed_at
        } for req in requests]
    }

@router.get("/created-withdrawal-requests")
async def get_created_withdrawal_requests(
    user: user_dependency,
    db: db_dependency,
    skip: int = 0,
    limit: int = 100,
    status: str = None  # Optional status filter
):
    """Get all withdrawal requests created by an agent or manager"""
    if isinstance(user, HTTPException):
        raise user

    # Verify the user is an agent or manager
    requester = db.query(Users).filter(
        Users.id == user['user_id'],
        Users.user_type.in_(["agent", "manager", "admin"])
    ).first()
    if not requester:
        raise HTTPException(status_code=403, detail="Only agents or managers can access this endpoint")

    # Build the base query
    query = db.query(
        Withdrawal_request,
        Users.fname,
        Users.lname,
        Users.email
    ).join(
        Users,
        Users.account_id == Withdrawal_request.account_id
    )

    # If user is not admin, filter by done_by
    if requester.user_type != "admin":
        query = query.filter(Withdrawal_request.done_by == str(user['user_id']))

    # Add status filter if provided
    if status:
        query = query.filter(Withdrawal_request.status == status)

    # Execute query with pagination
    results = query.order_by(
        Withdrawal_request.created_at.desc()
    ).offset(skip).limit(limit).all()

    return {
        "message": "Withdrawal requests retrieved successfully",
        "total_requests": len(results),
        "requests": [{
            "id": req.Withdrawal_request.id,
            "user": {
                "name": f"{req.fname} {req.lname}",
                "email": req.email
            },
            "amount": req.Withdrawal_request.amount,
            "withdrawal_amount": req.Withdrawal_request.withdrawal_amount,
            "withdrawal_currency": req.Withdrawal_request.withdrawal_currency,
            "wallet_type": req.Withdrawal_request.wallet_type,
            "status": req.Withdrawal_request.status,
            "charges": req.Withdrawal_request.charges,
            "total_amount": req.Withdrawal_request.total_amount,
            "created_at": req.Withdrawal_request.created_at,
            "processed_at": req.Withdrawal_request.processed_at
        } for req in results]
    }

# Add this function to handle commission and profit distribution
async def distribute_fees(
    db: Session,
    amount: float,
    agent_id: str,
    fee_type: Literal["withdrawal", "deposit"]
) -> dict:
    """
    Distribute fees between agent/manager and platform.
    Only tracks system profit.
    """
    # Calculate fees
    total_fee = amount * 0.05  # 5% total fee
    agent_commission = amount * 0.03  # 3% agent commission
    platform_fee = amount * 0.02  # 2% platform fee

    # Get agent details
    agent = db.query(Users).filter(Users.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Credit agent's commission wallet
    agent_wallet = db.query(Wallet).filter(
        Wallet.account_id == agent.account_id,
        Wallet.wallet_type == f"{agent.user_type}-wallet"
    ).first()
    
    if agent_wallet:
        agent_wallet.balance += agent_commission
    else:
        # Create commission wallet if it doesn't exist
        agent_wallet = Wallet(
            account_id=agent.account_id,
            balance=agent_commission,
            wallet_type=f"{agent.user_type}-wallet"
        )
        db.add(agent_wallet)

    # Get manager if agent has one
    manager = None
    if agent.user_type == "agent":
        manager = db.query(Users).filter(
            Users.id == agent.manager_id,
            Users.user_type == "manager"
        ).first()

    manager_commission = 0
    if manager:
        # Manager gets 20% of platform fee
        manager_commission = platform_fee * 0.2
        manager_wallet = db.query(Wallet).filter(
            Wallet.account_id == manager.account_id,
            Wallet.wallet_type == "manager-wallet"
        ).first()
        
        if manager_wallet:
            manager_wallet.balance += manager_commission
        else:
            manager_wallet = Wallet(
                account_id=manager.account_id,
                balance=manager_commission,
                wallet_type="manager-wallet"
            )
            db.add(manager_wallet)

    # Record only system profit (after manager commission)
    system_profit = platform_fee - manager_commission
    profit_entry = Profit(
        amount=system_profit,
        fee_type=fee_type,
        transaction_amount=amount
    )
    db.add(profit_entry)

    return {
        "total_fee": total_fee,
        "breakdown": {
            "agent_commission": agent_commission,
            "manager_commission": manager_commission,
            "system_profit": system_profit
        }
    }
