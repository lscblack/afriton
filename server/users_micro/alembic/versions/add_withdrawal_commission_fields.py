"""add commission fields to withdrawal requests

Revision ID: add_withdrawal_commission_fields
Revises: your_previous_revision_id
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_withdrawal_commission_fields'
down_revision = 'your_previous_revision_id'  # Replace with your last revision ID
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add commission-related columns
    op.add_column('withdrawal_requests', sa.Column('agent_commission', sa.Float(), nullable=True))
    op.add_column('withdrawal_requests', sa.Column('manager_commission', sa.Float(), nullable=True))
    op.add_column('withdrawal_requests', sa.Column('platform_profit', sa.Float(), nullable=True))

def downgrade() -> None:
    # Remove commission-related columns
    op.drop_column('withdrawal_requests', 'platform_profit')
    op.drop_column('withdrawal_requests', 'manager_commission')
    op.drop_column('withdrawal_requests', 'agent_commission') 