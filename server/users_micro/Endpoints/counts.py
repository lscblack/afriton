from fastapi import APIRouter, HTTPException, status
from utils.token_verify import user_dependency
from db.connection import db_dependency
from models.userModels import Users, Transaction_history, Withdrawal_request, Wallet, Workers, Profit
from sqlalchemy import func, and_, case, cast, String, Integer, DateTime
from datetime import datetime, timedelta
from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy.types import DateTime

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

@router.get("/manager-stats")
async def get_manager_stats(
    user: user_dependency,
    db: db_dependency
):
    """Get statistics for manager dashboard"""
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

        # Get agent user records to check active status
        agent_ids = [agent.user_id for agent in agents]
        agent_users = db.query(Users).filter(Users.id.in_(agent_ids)).all()
        
        # Calculate active agents (those who have processed transactions in last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_agents = db.query(Transaction_history.done_by).distinct().filter(
            Transaction_history.done_by.in_([str(id) for id in agent_ids]),
            Transaction_history.created_at >= thirty_days_ago
        ).count()

        # Get manager's commission wallet
        manager_wallet = db.query(Wallet).filter(
            Wallet.account_id == manager.account_id,
            Wallet.wallet_type == 'manager-wallet'
        ).first()

        # Calculate monthly growth (compare this month's transactions to last month)
        this_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month = (this_month - timedelta(days=1)).replace(day=1)
        
        this_month_transactions = db.query(Transaction_history).filter(
            Transaction_history.done_by.in_([str(id) for id in agent_ids]),
            Transaction_history.created_at >= this_month
        ).count()
        
        last_month_transactions = db.query(Transaction_history).filter(
            Transaction_history.done_by.in_([str(id) for id in agent_ids]),
            Transaction_history.created_at >= last_month,
            Transaction_history.created_at < this_month
        ).count()

        # Calculate growth percentage
        monthly_growth = 0
        if last_month_transactions > 0:
            monthly_growth = ((this_month_transactions - last_month_transactions) / last_month_transactions) * 100
        elif this_month_transactions > 0:
            monthly_growth = 100

        # Get performance metrics for each agent
        performance_metrics = []
        for agent in agents:
            agent_user = next((u for u in agent_users if u.id == agent.user_id), None)
            if agent_user:
                # Get agent's commission wallet
                agent_wallet = db.query(Wallet).filter(
                    Wallet.account_id == agent_user.account_id,
                    Wallet.wallet_type == 'agent-wallet'
                ).first()

                # Get agent's transaction count
                transaction_count = db.query(Transaction_history).filter(
                    Transaction_history.done_by == str(agent.user_id)
                ).count()

                performance_metrics.append({
                    "agentName": f"{agent_user.fname} {agent_user.lname}",
                    "agentId": agent_user.account_id,
                    "transactions": transaction_count,
                    "commission": agent_wallet.balance if agent_wallet else 0,
                    "performance": monthly_growth  # Individual agent performance could be calculated here
                })

        return {
            "totalAgents": len(agents),
            "activeAgents": active_agents,
            "totalCommission": manager_wallet.balance if manager_wallet else 0,
            "monthlyGrowth": round(monthly_growth, 2),
            "performanceMetrics": performance_metrics
        }

    except Exception as e:
        print(f"Error fetching manager stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin-dashboard-stats")
async def get_admin_dashboard_stats(
    user: user_dependency,
    db: db_dependency
):
    """Get comprehensive statistics for admin dashboard"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify user is admin
        admin = db.query(Users).filter(
            Users.id == user['user_id'],
            Users.user_type == "admin"
        ).first()
        if not admin:
            raise HTTPException(status_code=403, detail="Access denied")

        # Get current time references
        now = datetime.utcnow()
        today = now.date()
        this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month = (this_month - timedelta(days=1)).replace(day=1)
        thirty_days_ago = now - timedelta(days=30)

        # User Statistics
        total_users = db.query(Users).count()
        total_agents = db.query(Users).filter(Users.user_type == "agent").count()
        total_managers = db.query(Users).filter(Users.user_type == "manager").count()
        active_users = db.query(Users).filter(Users.acc_status == True).count()

        # Transaction Statistics
        transactions = db.query(Transaction_history).filter(
            func.cast(Transaction_history.created_at, DateTime) >= thirty_days_ago
        ).all()

        total_volume = sum(abs(float(tx.amount)) for tx in transactions if tx.amount is not None)
        total_deposits = sum(float(tx.amount) for tx in transactions if tx.transaction_type == "deposit" and tx.amount is not None and tx.amount > 0)
        total_withdrawals = sum(abs(float(tx.amount)) for tx in transactions if tx.transaction_type == "withdrawal" and tx.amount is not None and tx.amount < 0)

        # Commission and Profit Statistics
        total_commission = db.query(func.coalesce(func.sum(Wallet.balance), 0)).filter(
            Wallet.wallet_type.in_(["agent-wallet", "manager-wallet"])
        ).scalar()

        total_profit = db.query(func.coalesce(func.sum(Profit.amount), 0)).scalar()

        # Monthly Growth
        this_month_transactions = db.query(Transaction_history).filter(
            func.cast(Transaction_history.created_at, DateTime) >= this_month
        ).count()
        
        last_month_transactions = db.query(Transaction_history).filter(
            func.cast(Transaction_history.created_at, DateTime) >= last_month,
            func.cast(Transaction_history.created_at, DateTime) < this_month
        ).count()

        # User growth - using proper casting
        new_users = db.query(Users).filter(
            func.cast(Users.created_at, DateTime) >= thirty_days_ago
        ).count()

        # Location Statistics with proper date casting
        location_stats = db.query(
            Workers.location,
            func.count(Workers.id).label('agent_count'),
            func.coalesce(func.sum(Transaction_history.amount), 0).label('volume')
        ).outerjoin(
            Transaction_history,
            Transaction_history.done_by == cast(Workers.user_id, String)
        ).group_by(Workers.location).all()

        # Recent Activities with proper date casting
        recent_activities = db.query(
            Transaction_history,
            Users.fname,
            Users.lname,
            Users.email
        ).join(
            Users,
            Users.id == cast(Transaction_history.done_by, Integer)
        ).filter(
            func.cast(Transaction_history.created_at, DateTime) >= thirty_days_ago
        ).order_by(
            Transaction_history.created_at.desc()
        ).limit(10).all()

        return {
            "overview": {
                "total_users": total_users,
                "total_agents": total_agents,
                "total_managers": total_managers,
                "active_users": active_users,
                "total_volume": float(total_volume),
                "total_deposits": float(total_deposits),
                "total_withdrawals": float(total_withdrawals),
                "total_commission": float(total_commission),
                "total_profit": float(total_profit)
            },
            "growth": {
                "monthly_transaction_growth": (
                    ((this_month_transactions - last_month_transactions) / last_month_transactions * 100)
                    if last_month_transactions > 0 else 0
                ),
                "user_growth": new_users
            },
            "location_stats": [{
                "location": stat.location,
                "agent_count": stat.agent_count,
                "volume": float(stat.volume) if stat.volume else 0
            } for stat in location_stats],
            "recent_activities": [{
                "id": activity.Transaction_history.id,
                "type": activity.Transaction_history.transaction_type,
                "amount": float(activity.Transaction_history.amount) if activity.Transaction_history.amount else 0,
                "created_at": activity.Transaction_history.created_at,
                "user": f"{activity.fname} {activity.lname}",
                "email": activity.email
            } for activity in recent_activities],
            "daily_stats": {
                "transactions": db.query(Transaction_history).filter(
                    func.date(func.cast(Transaction_history.created_at, DateTime)) == today
                ).count(),
                "new_users": db.query(Users).filter(
                    func.date(func.cast(Users.created_at, DateTime)) == today
                ).count(),
                "volume": float(db.query(func.coalesce(func.sum(Transaction_history.amount), 0)).filter(
                    func.date(func.cast(Transaction_history.created_at, DateTime)) == today
                ).scalar())
            }
        }

    except Exception as e:
        print(f"Error fetching admin stats: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred while fetching statistics: {str(e)}"
        )

@router.get("/admin-commission-stats")
async def get_admin_commission_stats(
    user: user_dependency,
    db: db_dependency
):
    """Get commission statistics for admin dashboard"""
    if isinstance(user, HTTPException):
        raise user

    try:
        # Verify user is admin
        admin = db.query(Users).filter(Users.id == user['user_id']).first()
        if not admin or admin.user_type != "admin":
            raise HTTPException(status_code=403, detail="Access denied")

        # Get commission statistics
        total_commission = db.query(func.coalesce(func.sum(Wallet.balance), 0)).filter(
            Wallet.wallet_type.in_(["agent-wallet", "manager-wallet"])
        ).scalar()

        monthly_commission = db.query(
            func.coalesce(func.sum(Transaction_history.amount), 0)
        ).filter(
            Transaction_history.transaction_type == "commission",
            func.date_trunc('month', func.cast(Transaction_history.created_at, DateTime)) == 
            func.date_trunc('month', func.current_timestamp())
        ).scalar()

        # Get agent statistics
        total_agents = db.query(Users).filter(Users.user_type == "agent").count()
        
        # Calculate active agents (those with transactions in last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_agents = db.query(Transaction_history.done_by).distinct().filter(
            Transaction_history.created_at >= thirty_days_ago
        ).count()

        # Calculate monthly growth
        this_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month = (this_month - timedelta(days=1)).replace(day=1)
        
        this_month_commission = db.query(func.coalesce(func.sum(Transaction_history.amount), 0)).filter(
            Transaction_history.transaction_type == "commission",
            Transaction_history.created_at >= this_month
        ).scalar()
        
        last_month_commission = db.query(func.coalesce(func.sum(Transaction_history.amount), 0)).filter(
            Transaction_history.transaction_type == "commission",
            Transaction_history.created_at >= last_month,
            Transaction_history.created_at < this_month
        ).scalar()

        monthly_growth = (
            ((this_month_commission - last_month_commission) / last_month_commission * 100)
            if last_month_commission > 0 else 0
        )

        # Get commission breakdown
        commission_breakdown = db.query(
            Transaction_history.transaction_type,
            func.coalesce(func.sum(Transaction_history.amount), 0).label('amount')
        ).filter(
            Transaction_history.transaction_type == "commission"
        ).group_by(Transaction_history.transaction_type).all()

        # Get agent commissions
        agent_commissions = db.query(
            Users.id,
            Users.fname,
            Users.lname,
            Users.account_id,
            func.count(Transaction_history.id).label('transaction_count'),
            func.coalesce(func.sum(Transaction_history.amount), 0).label('commission')
        ).join(
            Transaction_history,
            Transaction_history.done_by == cast(Users.id, String)
        ).filter(
            Users.user_type == "agent",
            Transaction_history.transaction_type == "commission"
        ).group_by(
            Users.id,
            Users.fname,
            Users.lname,
            Users.account_id
        ).all()

        return {
            "total_commission": float(total_commission),
            "monthly_commission": float(monthly_commission),
            "total_agents": total_agents,
            "active_agents": active_agents,
            "monthly_growth": round(monthly_growth, 2),
            "commission_breakdown": [{
                "type": breakdown.transaction_type,
                "amount": float(breakdown.amount)
            } for breakdown in commission_breakdown],
            "agent_commissions": [{
                "agent_id": agent.account_id,
                "agent_name": f"{agent.fname} {agent.lname}",
                "transaction_count": agent.transaction_count,
                "commission": float(agent.commission),
                "performance": monthly_growth  # Individual performance could be calculated here
            } for agent in agent_commissions]
        }

    except Exception as e:
        print(f"Error fetching admin commission stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch commission statistics: {str(e)}"
        )