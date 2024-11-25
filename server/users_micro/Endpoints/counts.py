from fastapi import APIRouter, HTTPException, status
from utils.token_verify import user_dependency
from db.connection import db_dependency
from models.userModels import Users, Transaction_history, Withdrawal_request, Wallet
from sqlalchemy import func, and_, case
from datetime import datetime, timedelta
from typing import Dict, List
from sqlalchemy.orm import Session

router = APIRouter(prefix="/counts", tags=["Counts"])

@router.get("/agent-dashboard-metrics")
async def get_agent_dashboard_metrics(
    user: user_dependency,
    db: db_dependency
) -> Dict:
    """Get all metrics for agent dashboard"""
    if isinstance(user, HTTPException):
        raise user

    # Verify user is an agent
    agent = db.query(Users).filter(
        Users.id == user['user_id'],
        Users.user_type == "agent"
    ).first()
    
    if not agent:
        raise HTTPException(status_code=403, detail="Only agents can access this endpoint")

    # Get agent's wallet
    agent_wallet = db.query(Wallet).filter(
        Wallet.account_id == agent.account_id,
        Wallet.wallet_type == "agent-wallet"
    ).first()

    # Calculate total deposits and withdrawals handled by agent
    transactions = db.query(Transaction_history).filter(
        Transaction_history.done_by == str(user['user_id'])
    ).all()

    total_deposits = sum(tx.amount for tx in transactions if tx.transaction_type == "deposit" and tx.amount > 0)
    total_withdrawals = sum(abs(tx.amount) for tx in transactions if tx.transaction_type == "withdrawal" and tx.amount < 0)
    total_commission = agent_wallet.balance if agent_wallet else 0

    # Calculate percentages
    deposit_percentage = min((total_deposits / 1000000) * 100, 100) if total_deposits > 0 else 0
    withdrawal_percentage = min((total_withdrawals / 1000000) * 100, 100) if total_withdrawals > 0 else 0
    commission_percentage = min((total_commission / 10000) * 100, 100) if total_commission > 0 else 0
    transaction_percentage = min((len(transactions) / 100) * 100, 100) if transactions else 0

    return {
        "metrics": {
            "deposits": {
                "total": total_deposits,
                "percentage": deposit_percentage,
                "formatted_total": f"₳{total_deposits/1000:.1f}K"
            },
            "withdrawals": {
                "total": total_withdrawals,
                "percentage": withdrawal_percentage,
                "formatted_total": f"₳{total_withdrawals/1000:.1f}K"
            },
            "commission": {
                "total": total_commission,
                "percentage": commission_percentage,
                "formatted_total": f"₳{total_commission/1000:.1f}K"
            },
            "transactions": {
                "total": len(transactions),
                "percentage": transaction_percentage,
                "formatted_total": str(len(transactions))
            }
        }
    }

@router.get("/agent-daily-transactions")
async def get_agent_daily_transactions(
    user: user_dependency,
    db: db_dependency
) -> Dict:
    """Get daily transaction activity for agent"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Get today's transactions by hour
        today = datetime.utcnow().date()
        
        # Initialize hours with zero values
        hours = {f"{h}:00": {"deposits": 0.0, "withdrawals": 0.0} 
                for h in range(24)}

        # Get all transactions for today
        transactions = db.query(Transaction_history).filter(
            Transaction_history.done_by == str(user['user_id']),
            func.date(Transaction_history.created_at) == today
        ).all()

        # Process transactions
        for tx in transactions:
            hour = tx.created_at.strftime('%H:00')
            if tx.transaction_type == 'deposit' and tx.amount > 0:
                hours[hour]['deposits'] += float(tx.amount)
            elif tx.transaction_type == 'withdrawal' and tx.amount < 0:
                hours[hour]['withdrawals'] += abs(float(tx.amount))

        # Convert to list format
        hourly_data = [
            {
                "hour": hour,
                "deposits": data["deposits"],
                "withdrawals": data["withdrawals"]
            }
            for hour, data in hours.items()
        ]

        return {"daily_transactions": hourly_data}
    except Exception as e:
        print(f"Error in daily transactions: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agent-weekly-activity")
async def get_agent_weekly_activity(
    user: user_dependency,
    db: db_dependency
) -> Dict:
    """Get weekly wallet activity for agent"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Get last 7 days range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)

        # Initialize days with zero values
        days = {}
        current = start_date
        while current <= end_date:
            day_key = current.strftime('%a')
            days[day_key] = {
                "day": day_key,
                "deposits": 0.0,
                "withdrawals": 0.0,
                "commission": 0.0,
                "wallet": 0.0
            }
            current += timedelta(days=1)

        # Get all transactions for the period
        transactions = db.query(Transaction_history).filter(
            Transaction_history.done_by == str(user['user_id']),
            Transaction_history.created_at.between(start_date, end_date)
        ).all()

        # Get agent's wallet balance
        agent_wallet = db.query(Wallet).filter(
            Wallet.account_id == db.query(Users.account_id).filter(Users.id == user['user_id']).scalar(),
            Wallet.wallet_type == "agent-wallet"
        ).first()

        wallet_balance = float(agent_wallet.balance) if agent_wallet else 0.0

        # Process transactions
        for tx in transactions:
            day = tx.created_at.strftime('%a')
            amount = abs(float(tx.amount))

            if tx.transaction_type == 'deposit' and tx.amount > 0:
                days[day]['deposits'] += amount
            elif tx.transaction_type == 'withdrawal' and tx.amount < 0:
                days[day]['withdrawals'] += amount

            if tx.wallet_type == 'agent-wallet':
                days[day]['commission'] += amount

            days[day]['wallet'] = wallet_balance

        # Convert to list format
        weekly_data = list(days.values())

        return {"weekly_activity": weekly_data}
    except Exception as e:
        print(f"Error in weekly activity: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agent-commission-breakdown")
async def get_agent_commission_breakdown(
    user: user_dependency,
    db: db_dependency
) -> Dict:
    """Get commission breakdown for agent"""
    if isinstance(user, HTTPException):
        raise user

    # Get commission transactions
    commission_data = db.query(
        Transaction_history.transaction_type,
        func.sum(Transaction_history.amount).label('total')
    ).filter(
        Transaction_history.done_by == str(user['user_id']),
        Transaction_history.wallet_type == 'agent-wallet'
    ).group_by(
        Transaction_history.transaction_type
    ).all()

    # Calculate percentages and format for frontend
    total_commission = sum(abs(c.total) for c in commission_data)
    
    commission_breakdown = [
        {
            "name": "Deposits",
            "value": next((abs(c.total) for c in commission_data if c.transaction_type == 'deposit'), 0),
            "color": '#3b82f6'
        },
        {
            "name": "Withdrawals",
            "value": next((abs(c.total) for c in commission_data if c.transaction_type == 'withdrawal'), 0),
            "color": '#ef4444'
        },
        {
            "name": "Transfers",
            "value": next((abs(c.total) for c in commission_data if c.transaction_type == 'transfer'), 0),
            "color": '#10b981'
        },
        {
            "name": "Other",
            "value": next((abs(c.total) for c in commission_data if c.transaction_type not in ['deposit', 'withdrawal', 'transfer']), 0),
            "color": '#f59e0b'
        }
    ]

    return {"commission_breakdown": commission_breakdown}