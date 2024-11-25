from fastapi import APIRouter, HTTPException,status
from utils.token_verify import user_dependency
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
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import func

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
@router.get("/get-wallet-details")
def get_wallet_details(
    user: user_dependency, 
    db: db_dependency,
    wallet_id: Optional[str] = None
):
    """Get wallet details for the authenticated user or specific wallet ID"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Get user details
        check_user = db.query(Users).filter(Users.id == user['user_id']).first()
        if not check_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Use provided wallet_id or user's account_id
        wallet_id = wallet_id if wallet_id else check_user.account_id

        # Get only existing wallets for this user
        wallet_details = db.query(Wallet).filter(
            Wallet.account_id == wallet_id,
            Wallet.wallet_status == True  # Only get active wallets
        ).all()

        if not wallet_details:
            return {
                "message": "No active wallets found",
                "user_type": check_user.user_type,
                "wallet_details": []
            }

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

        # Format response with only existing wallets
        response_wallets = [{
            "id": wallet.id,
            "account_id": wallet.account_id,
            "balance": float(wallet.balance),
            "wallet_type": wallet.wallet_type,
            "wallet_status": wallet.wallet_status,
            "created_at": wallet.created_at,
            "exists": True,
            "description": wallet_descriptions.get(wallet.wallet_type, "")
        } for wallet in wallet_details]

        return {
            "message": "Wallet details retrieved successfully",
            "user_type": check_user.user_type,
            "wallet_details": response_wallets
        }
    except Exception as e:
        print(f"Error getting wallet details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get wallet details: {str(e)}"
        )

#admin can see all wallets of user
@router.get("/admin-view-wallets")
async def admin_view_wallets(user: user_dependency, db: db_dependency):
    if isinstance(user, HTTPException):
        raise user
    
    # Check if user is admin
    check_user = db.query(Users).filter(Users.id == user['user_id'], Users.user_type == "admin").first()
    if not check_user:
        raise HTTPException(status_code=403, detail="User not authorized")
    
    try:
        # Get totals for each wallet type
        wallet_totals = db.query(
            Wallet.wallet_type,
            func.count(Wallet.id).label('count'),
            func.sum(Wallet.balance).label('total')
        ).group_by(Wallet.wallet_type).all()

        # Format wallet totals
        wallet_stats = {
            "savings_total": 0.0,
            "goal_total": 0.0,
            "business_total": 0.0,
            "family_total": 0.0,
            "emergency_total": 0.0,
            "agent_total": 0.0,
            "manager_total": 0.0,
            "total_balance": 0.0,
            "wallet_counts": {}
        }

        for wallet_type, count, total in wallet_totals:
            key = f"{wallet_type.replace('-wallet', '')}_total"
            wallet_stats[key] = float(total or 0)
            wallet_stats["total_balance"] += float(total or 0)
            wallet_stats["wallet_counts"][wallet_type] = count

        return wallet_stats

    except Exception as e:
        print(f"Error fetching wallet stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch wallet statistics: {str(e)}"
        )
    
@router.post("/create-withdrawal-request")
async def create_withdrawal_request(
    user: user_dependency,
    db: db_dependency,
    amount: float,
    account_id: str,
    withdrawal_currency: str,
    wallet_type: str
):
    """Create a withdrawal request"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify the user making the request is an agent or manager
        requester = db.query(Users).filter(
            Users.id == user['user_id'],
            Users.user_type.in_(["agent", "manager"])
        ).first()
        if not requester:
            raise HTTPException(status_code=403, detail="Only agents or managers can create withdrawal requests")

        # Get user details
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
        total_fee = amount * 0.05
        agent_commission = amount * 0.03  # 3% agent commission
        platform_profit = amount * 0.02   # 2% platform profit
        total_amount = amount + total_fee

        # Check if wallet has sufficient balance
        if total_amount > wallet.balance:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient balance. Need {total_amount} Afriton (including 5% fees)"
            )

        # Convert to withdrawal currency
        try:
            withdrawal_amount = convert_from_afriton(amount, withdrawal_currency, db)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Calculate and distribute fees
        fee_distribution = await distribute_fees(
            db=db,
            amount=amount,
            agent_id=str(user['user_id']),
            fee_type="withdrawal"
        )

        # Create withdrawal request with commission fields
        withdrawal = Withdrawal_request(
            account_id=account_id,
            amount=amount,
            withdrawal_amount=withdrawal_amount,
            withdrawal_currency=withdrawal_currency,
            wallet_type=wallet_type,
            status="Pending",
            request_to="agent",
            total_amount=amount + fee_distribution["total_fee"],
            charges=fee_distribution["total_fee"],
            agent_commission=fee_distribution["breakdown"]["agent_commission"],
            platform_profit=fee_distribution["breakdown"]["platform_profit"],
            done_by=str(user['user_id'])
        )

        db.add(withdrawal)
        db.commit()
        db.refresh(withdrawal)

        # Send notification email
        try:
            heading = "Withdrawal Request Submitted"
            sub = "New Withdrawal Request"
            body = f"""
            <p>Hi {check_user.fname},</p>
            <p>A withdrawal request has been submitted:</p>
            <ul>
                <li>Amount: {withdrawal_amount} {withdrawal_currency}</li>
                <li>Amount in Afriton: {amount} AFT</li>
                <li>Service Fee (5%): {total_fee} AFT</li>
                <li>Total Deduction: {total_amount} AFT</li>
                <li>Status: Pending</li>
            </ul>
            <p>You will be notified once your request is processed.</p>
            """
            msg = custom_email(check_user.fname, heading, body)
            send_new_email(check_user.email, sub, msg)
        except Exception as e:
            print(f"Email notification error: {str(e)}")

        return {
            "message": "Withdrawal request created successfully",
            "details": {
                "id": withdrawal.id,
                "amount": amount,
                "withdrawal_amount": withdrawal_amount,
                "withdrawal_currency": withdrawal_currency,
                "total_amount": total_amount,
                "charges": total_fee,
                "status": "Pending",
                "commission_details": {
                    "agent_commission": agent_commission,
                    "platform_profit": platform_profit
                }
            }
        }

    except Exception as e:
        db.rollback()
        print(f"Error creating withdrawal request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/respond-withdrawal-request/{request_id}")
async def respond_withdrawal_request(
    request_id: int,
    action: Literal["Approve", "Reject"],
    user: user_dependency,
    db: db_dependency
):
    """Respond to a withdrawal request"""
    if isinstance(user, HTTPException):
        raise user

    try:
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
            # Process approval logic
            if wallet.balance < request.total_amount:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient balance. Required: {request.total_amount} Afriton"
                )

            # Update wallet balance
            wallet.balance -= request.total_amount

            # Create transaction record
            transaction = Transaction_history(
                account_id=request.account_id,
                amount=-request.total_amount,
                transaction_type="withdrawal",
                wallet_type=request.wallet_type,
                done_by=str(user['user_id'])
            )
            db.add(transaction)

        # Update request status
        request.status = action + "d"  # "Approved" or "Rejected"
        request.processed_at = datetime.utcnow()

        db.commit()

        # Send email notification
        try:
            # Get user details for email
            user_details = db.query(Users).filter(Users.account_id == request.account_id).first()
            agent_details = db.query(Users).filter(Users.id == user['user_id']).first()
            
            heading = "Withdrawal Request Update"
            sub = f"Withdrawal Request {action}ed"
            
            if action == "Approve":
                body = f"""
                <p>Hi {user_details.fname},</p>
                <p>Your withdrawal request has been approved.</p>
                <p>Details:</p>
                <ul>
                    <li>Amount: {request.withdrawal_amount} {request.withdrawal_currency}</li>
                    <li>Amount in Afriton: {request.amount} AFT</li>
                    <li>Service Fee: {request.charges} AFT</li>
                    <li>Total Deducted: {request.total_amount} AFT</li>
                    <li>Processed by: {agent_details.fname} {agent_details.lname}</li>
                </ul>
                <p>The funds will be processed shortly.</p>
                """
            else:
                body = f"""
                <p>Hi {user_details.fname},</p>
                <p>Your withdrawal request has been rejected.</p>
                <p>Details of rejected request:</p>
                <ul>
                    <li>Amount: {request.withdrawal_amount} {request.withdrawal_currency}</li>
                    <li>Amount in Afriton: {request.amount} AFT</li>
                    <li>Processed by: {agent_details.fname} {agent_details.lname}</li>
                </ul>
                <p>Please contact support if you have any questions.</p>
                """

            msg = custom_email(user_details.fname, heading, body)
            send_new_email(user_details.email, sub, msg)

        except Exception as e:
            print(f"Email notification error: {str(e)}")
            # Continue with the request even if email fails
            
        return {
            "message": f"Withdrawal request {action.lower()}ed successfully",
            "request_id": request_id,
            "status": request.status,
            "processed_at": request.processed_at
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Create a model for the deposit request
class DepositRequest(BaseModel):
    account_id: str
    amount: float
    currency: str
    wallet_type: str

@router.post("/create-deposit-request")
async def create_deposit_request(
    user: user_dependency,
    db: db_dependency,
    account_id: str,
    amount: float,
    currency: str,
    wallet_type: str
):
    """Create a deposit request"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify the user making the request is an agent or manager
        requester = db.query(Users).filter(
            Users.id == user['user_id'],
            Users.user_type.in_(["agent", "manager"])
        ).first()
        
        if not requester:
            raise HTTPException(
                status_code=403, 
                detail="Only agents or managers can create deposit requests"
            )

        # Get user details
        target_user = db.query(Users).filter(
            Users.account_id == account_id
        ).first()
        
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get wallet
        wallet = db.query(Wallet).filter(
            Wallet.account_id == account_id,
            Wallet.wallet_type == wallet_type
        ).first()

        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")

        # Convert amount to Afriton
        try:
            afriton_amount = convert_to_afriton(amount, currency, db)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Calculate and distribute fees
        fee_distribution = await distribute_fees(
            db=db,
            amount=afriton_amount,  # Use converted amount
            agent_id=str(user['user_id']),
            fee_type="deposit"
        )

        # Update wallet balance
        wallet.balance += afriton_amount

        # Create transaction history
        transaction = Transaction_history(
            account_id=account_id,
            amount=afriton_amount,
            original_amount=amount,
            original_currency=currency,
            transaction_type="deposit",
            wallet_type=wallet_type,
            done_by=str(user['user_id'])
        )
        
        db.add(transaction)
        db.commit()

        # Send email notifications
        try:
            # Email to customer
            customer_heading = "Deposit Confirmation"
            customer_sub = "New Deposit to Your Wallet"
            customer_body = f"""
            <p>Hi {target_user.fname},</p>
            <p>A deposit has been made to your {wallet_type} wallet:</p>
            <ul>
                <li>Amount: {amount} {currency}</li>
                <li>Converted Amount: {afriton_amount} Afriton</li>
                <li>Wallet Type: {wallet_type}</li>
                <li>New Balance: {wallet.balance} Afriton</li>
                <li>Transaction ID: {transaction.id}</li>
                <li>Processed by: {requester.fname} {requester.lname}</li>
            </ul>
            <p>If you did not authorize this transaction, please contact support immediately.</p>
            """
            customer_msg = custom_email(target_user.fname, customer_heading, customer_body)
            send_new_email(target_user.email, customer_sub, customer_msg)

            # Email to agent/manager
            agent_heading = "Deposit Transaction Successful"
            agent_sub = "Deposit Transaction Confirmation"
            agent_body = f"""
            <p>Hi {requester.fname},</p>
            <p>You have successfully processed a deposit:</p>
            <ul>
                <li>Customer: {target_user.fname} {target_user.lname}</li>
                <li>Amount: {amount} {currency}</li>
                <li>Converted Amount: {afriton_amount} Afriton</li>
                <li>Wallet Type: {wallet_type}</li>
                <li>Transaction ID: {transaction.id}</li>
            </ul>
            <p>Transaction has been recorded and customer has been notified.</p>
            """
            agent_msg = custom_email(requester.fname, agent_heading, agent_body)
            send_new_email(requester.email, agent_sub, agent_msg)

        except Exception as e:
            print(f"Email notification error: {str(e)}")
            # Don't raise exception here, as the transaction was successful
            # Just log the email error

        return {
            "message": "Deposit processed successfully",
            "details": {
                "account_id": account_id,
                "amount": amount,
                "currency": currency,
                "converted_amount": afriton_amount,
                "wallet_type": wallet_type,
                "new_balance": wallet.balance,
                "transaction_id": transaction.id
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

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
    from_wallet_type: str
):
    """Transfer money between wallets"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Get sender details
        sender = db.query(Users).filter(Users.id == user['user_id']).first()
        if not sender:
            raise HTTPException(status_code=404, detail="Sender not found")

        # For agent-wallet transfers, recipient must be the same user
        if from_wallet_type == "agent-wallet":
            if sender.account_id != recipient_account_id:
                raise HTTPException(
                    status_code=400, 
                    detail="Agent wallet transfers must be to your own savings wallet"
                )
            to_wallet_type = "savings"  # Force transfer to savings wallet
        else:
            # For other transfers, verify recipient
            recipient = db.query(Users).filter(
                Users.account_id == recipient_account_id,
                Users.acc_status == True,
                Users.is_wallet_active == True
            ).first()
            if not recipient:
                raise HTTPException(
                    status_code=404, 
                    detail="Recipient not found or account not activated"
                )
            to_wallet_type = "savings"  # Default recipient wallet type

        # Get sender's wallet first to check balance
        sender_wallet = db.query(Wallet).filter(
            Wallet.account_id == sender.account_id,
            Wallet.wallet_type == from_wallet_type
        ).first()

        if not sender_wallet:
            raise HTTPException(status_code=404, detail="Sender wallet not found")

        # Convert amount if not in AFT
        try:
            if currency.upper() != 'AFT':
                afriton_amount = convert_to_afriton(amount, currency, db)
            else:
                afriton_amount = float(amount)  # Convert to float for comparison
        except HTTPException as e:
            raise e

        # Check sufficient balance before proceeding
        if sender_wallet.balance < afriton_amount:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient balance. Available: {sender_wallet.balance} AFT, Required: {afriton_amount} AFT"
            )

        # Get or create recipient's savings wallet
        recipient_wallet = db.query(Wallet).filter(
            Wallet.account_id == recipient_account_id,
            Wallet.wallet_type == to_wallet_type
        ).first()
        
        if not recipient_wallet:
            recipient_wallet = Wallet(
                account_id=recipient_account_id,
                balance=0,
                wallet_type=to_wallet_type
            )
            db.add(recipient_wallet)

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
            wallet_type=to_wallet_type,
            done_by=str(user['user_id'])
        )

        db.add(sender_transaction)
        db.add(recipient_transaction)
        db.commit()

        # Send email notifications
        try:
            # To sender
            sender_body = f"""
            <p>Hi {sender.fname},</p>
            <p>Your transfer has been completed successfully:</p>
            <ul>
                <li>Amount Sent: {amount} {currency}</li>
                <li>Converted Amount: {afriton_amount} AFT</li>
                <li>From Wallet: {from_wallet_type}</li>
                <li>To Wallet: {to_wallet_type}</li>
            </ul>
            <p>Your new balance is: {sender_wallet.balance} AFT</p>
            """
            send_new_email(
                sender.email,
                "Transfer Confirmation",
                custom_email(sender.fname, "Transfer Sent", sender_body)
            )

            # To recipient (if different from sender)
            if sender.account_id != recipient_account_id:
                recipient = db.query(Users).filter(Users.account_id == recipient_account_id).first()
                recipient_body = f"""
                <p>Hi {recipient.fname},</p>
                <p>You have received a transfer:</p>
                <ul>
                    <li>Amount: {amount} {currency}</li>
                    <li>Converted Amount: {afriton_amount} AFT</li>
                    <li>From: {sender.fname} {sender.lname}</li>
                    <li>To Wallet: {to_wallet_type}</li>
                </ul>
                <p>Your new balance is: {recipient_wallet.balance} AFT</p>
                """
                send_new_email(
                    recipient.email,
                    "Transfer Received",
                    custom_email(recipient.fname, "Transfer Received", recipient_body)
                )

        except Exception as e:
            print(f"Email notification error: {str(e)}")

        return {
            "message": "Transfer completed successfully",
            "details": {
                "amount": amount,
                "currency": currency,
                "converted_amount": afriton_amount,
                "from_wallet": from_wallet_type,
                "to_wallet": to_wallet_type,
                "new_balance": sender_wallet.balance
            }
        }

    except Exception as e:
        db.rollback()
        print(f"Transfer error: {str(e)}")  # Add logging
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

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
    Distribute fees between agent and platform.
    Only withdrawals get commission, deposits only track platform profit.
    """
    try:
        # Calculate fees
        total_fee = amount * 0.05  # 5% total fee
        
        if fee_type == "withdrawal":
            # Only withdrawals get agent commission
            agent_commission = amount * 0.03  # 3% agent commission
            platform_fee = amount * 0.02  # 2% platform fee
            
            # Get agent details
            agent = db.query(Users).filter(Users.id == agent_id).first()
            if not agent:
                raise HTTPException(status_code=404, detail="Agent not found")

            # Credit agent's commission wallet
            agent_wallet = db.query(Wallet).filter(
                Wallet.account_id == agent.account_id,
                Wallet.wallet_type == "agent-wallet"
            ).first()
            
            if agent_wallet:
                agent_wallet.balance += agent_commission
            else:
                # Create commission wallet if it doesn't exist
                agent_wallet = Wallet(
                    account_id=agent.account_id,
                    balance=agent_commission,
                    wallet_type="agent-wallet"
                )
                db.add(agent_wallet)

            # Create commission transaction record
            commission_transaction = Transaction_history(
                account_id=agent.account_id,
                amount=agent_commission,
                transaction_type="commission",
                wallet_type="agent-wallet",
                done_by=str(agent_id)
            )
            db.add(commission_transaction)
        else:
            # For deposits, all fee goes to platform
            agent_commission = 0
            platform_fee = total_fee

        # Record system profit
        profit_entry = Profit(
            amount=platform_fee,
            fee_type=fee_type,
            transaction_amount=amount
        )
        db.add(profit_entry)

        db.commit()

        return {
            "total_fee": total_fee,
            "breakdown": {
                "agent_commission": agent_commission,
                "platform_profit": platform_fee
            }
        }
    except Exception as e:
        print(f"Error in distribute_fees: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions/last-transaction")
async def get_last_transaction(
    user: user_dependency,
    db: db_dependency,
    account_id: str,
    wallet_type: str = None  # Make wallet_type optional
):
    """Get the last transaction for a specific wallet or all wallets"""
    if isinstance(user, HTTPException):
        raise user

    # Verify user has permission
    check_user = db.query(Users).filter(Users.id == user['user_id']).first()
    if not check_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Only allow users to view their own transactions unless they're admin/manager
    if check_user.account_id != account_id and check_user.user_type not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these transactions")

    # Base query
    query = db.query(Transaction_history).filter(
        Transaction_history.account_id == account_id
    )

    # Add wallet type filter if specified
    if wallet_type:
        query = query.filter(Transaction_history.wallet_type == wallet_type)

    # Get last transaction for each wallet type
    last_transactions = {}
    
    if wallet_type:
        # Get single wallet's last transaction
        last_transaction = query.order_by(Transaction_history.created_at.desc()).first()
        if last_transaction:
            last_transactions[wallet_type] = {
                "id": last_transaction.id,
                "amount": last_transaction.amount,
                "original_amount": last_transaction.original_amount,
                "original_currency": last_transaction.original_currency,
                "transaction_type": last_transaction.transaction_type,
                "wallet_type": last_transaction.wallet_type,
                "created_at": last_transaction.created_at,
                "status": last_transaction.status,
                "done_by": last_transaction.done_by
            }
    else:
        # Get last transaction for each wallet type
        wallet_types = db.query(Transaction_history.wallet_type).filter(
            Transaction_history.account_id == account_id
        ).distinct().all()
        
        for wt in wallet_types:
            last_tx = query.filter(
                Transaction_history.wallet_type == wt[0]
            ).order_by(Transaction_history.created_at.desc()).first()
            
            if last_tx:
                last_transactions[wt[0]] = {
                    "id": last_tx.id,
                    "amount": last_tx.amount,
                    "original_amount": last_tx.original_amount,
                    "original_currency": last_tx.original_currency,
                    "transaction_type": last_tx.transaction_type,
                    "wallet_type": last_tx.wallet_type,
                    "created_at": last_tx.created_at,
                    "status": last_tx.status,
                    "done_by": last_tx.done_by
                }

    return {
        "message": "Last transactions retrieved successfully",
        "transactions": last_transactions
    }

@router.get("/transactions/all")
async def get_all_transactions(
    user: user_dependency,
    db: db_dependency,
    account_id: Optional[str] = None,
    wallet_type: Optional[str] = None,
    include_processed: Optional[bool] = False,
    page: int = 1,
    per_page: int = 10,
    done_by: Optional[str] = None
):
    """Get all transactions with pagination"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify user has permission
        check_user = db.query(Users).filter(Users.id == user['user_id']).first()
        if not check_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Base query
        base_query = db.query(Transaction_history)

        # Add filters based on parameters
        if account_id:
            base_query = base_query.filter(Transaction_history.account_id == account_id)
        
        if wallet_type:
            base_query = base_query.filter(Transaction_history.wallet_type == wallet_type)
            
        if done_by:
            base_query = base_query.filter(Transaction_history.done_by == done_by)
        elif include_processed:
            # Include transactions processed by this user
            base_query = base_query.filter(
                Transaction_history.done_by == str(user['user_id'])
            )

        # Calculate pagination
        total_items = base_query.count()
        total_pages = (total_items + per_page - 1) // per_page
        skip = (page - 1) * per_page

        # Get paginated transactions
        transactions = base_query.order_by(
            Transaction_history.created_at.desc()
        ).offset(skip).limit(per_page).all()

        # Format the response
        transaction_list = []
        for tx in transactions:
            # Get user details for the transaction
            tx_user = db.query(Users).filter(Users.account_id == tx.account_id).first()
            tx_agent = db.query(Users).filter(Users.id == int(tx.done_by)).first() if tx.done_by else None

            transaction_list.append({
                "id": tx.id,
                "amount": tx.amount,
                "original_amount": tx.original_amount,
                "original_currency": tx.original_currency,
                "transaction_type": tx.transaction_type,
                "wallet_type": tx.wallet_type,
                "created_at": tx.created_at,
                "status": tx.status,
                "done_by": tx.done_by,
                "user_name": f"{tx_user.fname} {tx_user.lname}" if tx_user else "Unknown",
                "agent_name": f"{tx_agent.fname} {tx_agent.lname}" if tx_agent else None,
                "is_processed_transaction": tx.done_by == str(user['user_id']),
                "account_id": tx.account_id
            })

        return {
            "message": "Transactions retrieved successfully",
            "transactions": transaction_list,
            "pagination": {
                "total_items": total_items,
                "total_pages": total_pages,
                "current_page": page,
                "per_page": per_page,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }

    except Exception as e:
        print(f"Error fetching transactions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


