from fastapi import APIRouter, HTTPException, status
from utils.token_verify import user_dependency
from db.connection import db_dependency
from models.userModels import Users, Transaction_history, Withdrawal_request, Wallet, Workers
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
        # Verify user is an agent
        agent = db.query(Users).filter(
            Users.id == user['user_id'],
            Users.user_type == "agent"
        ).first()
        
        if not agent:
            raise HTTPException(status_code=403, detail="Only agents can access this endpoint")

        # Get today's date in UTC
        today = datetime.utcnow().date()
        
        # Initialize hours with zero values
        hours = {f"{h:02d}:00": {"deposits": 0.0, "withdrawals": 0.0} 
                for h in range(24)}

        # Get all transactions for today using date comparison
        transactions = db.query(Transaction_history).filter(
            Transaction_history.done_by == str(user['user_id']),
            func.date(Transaction_history.created_at) == today
        ).all()

        # Process transactions
        for tx in transactions:
            try:
                # Format hour with leading zero
                hour = tx.created_at.strftime('%H:00')
                
                # Handle transaction types
                if tx.transaction_type == 'deposit':
                    amount = float(tx.amount) if tx.amount else 0.0
                    if amount > 0:
                        hours[hour]['deposits'] += amount
                elif tx.transaction_type == 'withdrawal':
                    amount = float(tx.amount) if tx.amount else 0.0
                    if amount < 0:
                        hours[hour]['withdrawals'] += abs(amount)
            except (ValueError, AttributeError) as e:
                print(f"Error processing transaction {tx.id}: {str(e)}")
                continue

        # Convert to list format and ensure proper number formatting
        hourly_data = [
            {
                "hour": hour,
                "deposits": round(data["deposits"], 2),
                "withdrawals": round(data["withdrawals"], 2)
            }
            for hour, data in sorted(hours.items())  # Sort by hour
        ]

        return {"daily_transactions": hourly_data}
    except Exception as e:
        print(f"Error in daily transactions: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="An error occurred while fetching daily transactions"
        )

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

@router.get("/manager-transactions")
async def get_manager_transactions(
    user: user_dependency,
    db: db_dependency,
    page: int = 1,
    per_page: int = 10
):
    """Get all transactions for a manager's network"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify user is a manager
        manager = db.query(Users).filter(Users.id == user['user_id']).first()
        if not manager or manager.user_type != 'manager':
            raise HTTPException(status_code=403, detail="Access denied")

        # Get all agents under this manager
        agents = db.query(Users).filter(
            Users.step_account_id == manager.id,
            Users.user_type == 'agent'
        ).all()
        agent_ids = [agent.id for agent in agents]

        # Get all transactions from these agents
        base_query = db.query(Transaction_history).filter(
            Transaction_history.done_by.in_([str(id) for id in agent_ids])
        )

        # Calculate pagination
        total_items = base_query.count()
        total_pages = (total_items + per_page - 1) // per_page
        skip = (page - 1) * per_page

        transactions = base_query.order_by(
            Transaction_history.created_at.desc()
        ).offset(skip).limit(per_page).all()

        # Format transactions
        transaction_list = []
        for tx in transactions:
            agent = db.query(Users).filter(Users.id == int(tx.done_by)).first()
            transaction_list.append({
                "id": tx.id,
                "amount": tx.amount,
                "transaction_type": tx.transaction_type,
                "wallet_type": tx.wallet_type,
                "created_at": tx.created_at,
                "status": tx.status,
                "agent_name": f"{agent.fname} {agent.lname}" if agent else "Unknown",
                "agent_id": agent.account_id if agent else None
            })

        return {
            "transactions": transaction_list,
            "pagination": {
                "total_items": total_items,
                "total_pages": total_pages,
                "current_page": page,
                "per_page": per_page
            }
        }

    except Exception as e:
        print(f"Error fetching manager transactions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/manager-commission-stats")
async def get_manager_commission_stats(
    user: user_dependency,
    db: db_dependency
):
    """Get commission statistics for a manager's network"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify user is a manager
        manager = db.query(Users).filter(Users.id == user['user_id']).first()
        if not manager or manager.user_type != 'manager':
            raise HTTPException(status_code=403, detail="Access denied")

        # Get manager's wallet
        manager_wallet = db.query(Wallet).filter(
            Wallet.account_id == manager.account_id,
            Wallet.wallet_type == 'manager-wallet'
        ).first()

        # Get all agents under this manager
        agents = db.query(Users).filter(
            Users.step_account_id == manager.id,
            Users.user_type == 'agent'
        ).all()

        # Calculate commission statistics
        total_commission = manager_wallet.balance if manager_wallet else 0
        monthly_commission = 0
        agent_commissions = []

        for agent in agents:
            agent_wallet = db.query(Wallet).filter(
                Wallet.account_id == agent.account_id,
                Wallet.wallet_type == 'agent-wallet'
            ).first()

            if agent_wallet:
                agent_commissions.append({
                    "agent_name": f"{agent.fname} {agent.lname}",
                    "agent_id": agent.account_id,
                    "commission": agent_wallet.balance,
                    "transaction_count": db.query(Transaction_history).filter(
                        Transaction_history.done_by == str(agent.id)
                    ).count()
                })

        # Get monthly trend
        current_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_transactions = db.query(Transaction_history).filter(
            Transaction_history.transaction_type == 'commission',
            Transaction_history.created_at >= current_month
        ).all()

        for tx in monthly_transactions:
            if tx.amount > 0:
                monthly_commission += tx.amount

        return {
            "total_commission": total_commission,
            "monthly_commission": monthly_commission,
            "agent_commissions": agent_commissions,
            "total_agents": len(agents),
            "active_agents": len([a for a in agent_commissions if a["transaction_count"] > 0])
        }

    except Exception as e:
        print(f"Error fetching manager commission stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/manager-agents")
async def get_manager_agents(
    user: user_dependency,
    db: db_dependency
):
    """Get all agents under a manager"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify user is a manager
        manager = db.query(Users).filter(Users.id == user['user_id']).first()
        if not manager or manager.user_type != 'manager':
            raise HTTPException(status_code=403, detail="Access denied")

        # Get all agents under this manager
        agents = db.query(Workers).filter(
            Workers.managed_by == manager.id,
            Workers.worker_type == 'agent'
        ).all()

        # Format agent data
        agent_list = []
        for agent in agents:
            user = db.query(Users).filter(Users.id == agent.user_id).first()
            if user:
                agent_list.append({
                    "id": agent.id,
                    "name": f"{user.fname} {user.lname}",
                    "email": user.email,
                    "location": agent.location,
                    "allowed_balance": agent.allowed_balance,
                    "available_balance": agent.available_balance,
                    "status": user.acc_status
                })

        return {
            "agents": agent_list
        }

    except Exception as e:
        print(f"Error fetching manager agents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/promote-to-agent")
async def promote_to_agent(
    user: user_dependency,
    db: db_dependency,
    email: str,
    location: str,
    allowed_balance: float
):
    """Promote a user to agent"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify user is a manager
        manager = db.query(Users).filter(Users.id == user['user_id']).first()
        if not manager or manager.user_type != 'manager':
            raise HTTPException(status_code=403, detail="Access denied")

        # Find user to promote
        promote_user = db.query(Users).filter(Users.email == email).first()
        if not promote_user:
            raise HTTPException(status_code=404, detail="User not found")

        if promote_user.user_type != 'citizen':
            raise HTTPException(status_code=400, detail="User is already an agent or manager")

        # Create worker record
        worker = Workers(
            user_id=promote_user.id,
            allowed_balance=allowed_balance,
            available_balance=0,
            location=location,
            worker_type='agent',
            managed_by=manager.id
        )
        db.add(worker)

        # Update user type
        promote_user.user_type = 'agent'
        
        db.commit()

        return {"message": "User promoted to agent successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print(f"Error promoting user to agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update-agent/{agent_id}")
async def update_agent(
    user: user_dependency,
    db: db_dependency,
    agent_id: int,
    updates: dict
):
    """Update agent details"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify user is a manager
        manager = db.query(Users).filter(Users.id == user['user_id']).first()
        if not manager or manager.user_type != 'manager':
            raise HTTPException(status_code=403, detail="Access denied")

        # Get agent
        agent = db.query(Workers).filter(
            Workers.id == agent_id,
            Workers.managed_by == manager.id
        ).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Update allowed fields
        if 'location' in updates:
            agent.location = updates['location']
        if 'allowed_balance' in updates:
            agent.allowed_balance = updates['allowed_balance']
        if 'status' in updates:
            user = db.query(Users).filter(Users.id == agent.user_id).first()
            if user:
                user.acc_status = updates['status']

        db.commit()
        return {"message": "Agent updated successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print(f"Error updating agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))