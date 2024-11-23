from fastapi import APIRouter, HTTPException,status
from db.VerifyToken import user_Front_dependency,user_dependency
from dotenv import load_dotenv
import random
from db.connection import db_dependency
from models.userModels import Users, OTP, Wallet,Withdrawal_request,Transaction_history,Workers
from typing import Literal
from functions.send_mail import send_new_email
from functions.send_mulltiple import send_new_multi_email
from emailsTemps.custom_email_send import custom_email
from schemas.emailSchemas import EmailSchema, OtpVerify
from datetime import datetime,timedelta
from Endpoints.conversionRate import convert_to_afriton, convert_from_afriton
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
    if isinstance(user, HTTPException):
        raise user
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user:
        raise HTTPException(status_code=404, detail="User not found")
    wallet_details = db.query(Wallet).filter(Wallet.account_id == check_user.account_id).all()
    if not wallet_details:
        raise HTTPException(status_code=404, detail="Wallet not found")

    # return wallet details

    return {"message": "Wallet details retrieved successfully", "wallet_details": wallet_details}

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
    currency: str,
    withdrawal_currency: str,  # Currency user wants to receive
    wallet_type: Literal["savings", "goal", "business", "family", "emergency", "agent-wallet", "manager-wallet"]
):
    """Create a withdrawal request with currency conversion"""
    if isinstance(user, HTTPException):
        raise user

    # Get user details
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Convert input amount to Afriton
    try:
        afriton_amount = convert_to_afriton(amount, currency, db)
    except HTTPException as e:
        raise e

    # Convert Afriton to withdrawal currency
    try:
        withdrawal_amount = convert_from_afriton(afriton_amount, withdrawal_currency, db)
    except HTTPException as e:
        raise e

    # Get wallet
    wallet = db.query(Wallet).filter(
        Wallet.account_id == check_user.account_id,
        Wallet.wallet_type == wallet_type
    ).first()

    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    if afriton_amount > wallet.balance:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    if afriton_amount < 5:  # Minimum withdrawal amount
        raise HTTPException(status_code=400, detail="Minimum withdrawal amount is 5 Afriton")

    # Calculate fees (5% total)
    total_fee_afriton = afriton_amount * 0.05
    agent_commission = afriton_amount * 0.03
    afriton_commission = afriton_amount * 0.02

    # Convert fees to withdrawal currency
    total_fee_withdrawal = convert_from_afriton(total_fee_afriton, withdrawal_currency, db)
    net_amount_withdrawal = withdrawal_amount - total_fee_withdrawal

    # Create withdrawal request
    withdrawal = Withdrawal_request(
        account_id=check_user.account_id,
        amount=amount,
        currency=currency,
        converted_amount=afriton_amount,
        withdrawal_amount=withdrawal_amount,
        withdrawal_currency=withdrawal_currency,
        wallet_type=wallet_type,
        status="Pending",
        request_to="agent"  # All withdrawal requests go to agents first
    )
    db.add(withdrawal)
    db.commit()

    # Send notification email
    heading = "Withdrawal Request Submitted"
    sub = "New Withdrawal Request"
    body = f"""
    <p>Hi {check_user.fname},</p>
    <p>Your withdrawal request has been submitted:</p>
    <ul>
        <li>Original Amount: {amount} {currency}</li>
        <li>Converted to Afriton: {afriton_amount} AFT</li>
        <li>Withdrawal Amount: {withdrawal_amount} {withdrawal_currency}</li>
        <li>Withdrawal Fee (5%): {total_fee_withdrawal} {withdrawal_currency}</li>
        <li>Net Amount to Receive: {net_amount_withdrawal} {withdrawal_currency}</li>
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
            "original_amount": amount,
            "original_currency": currency,
            "afriton_amount": afriton_amount,
            "withdrawal_amount": withdrawal_amount,
            "withdrawal_currency": withdrawal_currency,
            "fee": total_fee_withdrawal,
            "net_amount": net_amount_withdrawal,
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

    # Validate user and fetch the withdrawal request
    request = db.query(Withdrawal_request).filter(
        Withdrawal_request.id == request_id,
        Withdrawal_request.account_id == user['account_id'],
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
        if request.converted_amount < 1:
            raise HTTPException(status_code=400, detail="Minimum withdrawal amount is 1 Afriton")

        # Calculate total charges (5%)
        total_charges = request.converted_amount * 0.05
        total_deduction = request.converted_amount + total_charges

        # Check if balance is sufficient to cover amount + charges
        if wallet.balance < total_deduction:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient balance. Total required (including 5% charges): {total_deduction} Afriton"
            )

        # Deduct balance (amount + charges) and create transaction history
        wallet.balance -= total_deduction
        transaction = Transaction_history(
            account_id=wallet.account_id,
            amount=total_deduction,  # Record total deduction including charges
            transaction_type="withdrawal",
            wallet_type=request.wallet_type,
            done_by=user['user_id']
        )
        db.add(transaction)
        request.status = "Approved"
        request.processed_at = datetime.utcnow()
    else:  # Reject
        request.status = "Rejected"
        request.processed_at = datetime.utcnow()

    db.commit()

    # Email notifications
    heading = "Withdrawal Request Update"
    sub = f"Withdrawal Request {action}"
    agent_body = f"""
    <p>Hi {request.request_to.fname},</p>
    <p>The withdrawal request of {request.converted_amount} Afriton from {request.wallet_type} wallet has been {action.lower()}ed.</p>
    """
    user_body = f"""
    <p>Hi {user['fname']},</p>
    <p>Your withdrawal request has been {action.lower()}ed.</p>
    """
    if action == "Approve":
        user_body += f"""
        <p>Details:</p>
        <ul>
            <li>Amount: {request.converted_amount} Afriton</li>
            <li>Charges (5%): {total_charges} Afriton</li>
            <li>Total Deducted: {total_deduction} Afriton</li>
            <li>Remaining Balance: {wallet.balance} Afriton</li>
        </ul>
        """

    # Send emails
    send_new_email(request.request_to.email, sub, custom_email(request.request_to.fname, heading, agent_body))
    send_new_email(user['email'], sub, custom_email(user['fname'], heading, user_body))

    return {
        "message": f"Withdrawal request {action.lower()}ed successfully",
        "status": action,
        "amount": request.converted_amount,
        "charges": total_charges if action == "Approve" else None,
        "total_deducted": total_deduction if action == "Approve" else None,
        "wallet_type": request.wallet_type,
        "processed_at": request.processed_at
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
