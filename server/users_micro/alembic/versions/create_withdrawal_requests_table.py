"""create withdrawal requests table

Revision ID: create_withdrawal_requests
Revises: your_previous_revision_id
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'create_withdrawal_requests'
down_revision = 'your_previous_revision_id'  # Replace with your last revision ID
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'withdrawal_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('withdrawal_amount', sa.Float(), nullable=False),
        sa.Column('withdrawal_currency', sa.String(), nullable=False),
        sa.Column('wallet_type', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='Pending'),
        sa.Column('request_to', sa.String(), nullable=False, server_default='agent'),
        sa.Column('processed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('done_by', sa.String(), nullable=True),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('charges', sa.Float(), nullable=False),
        sa.Column('agent_commission', sa.Float(), nullable=True),
        sa.Column('manager_commission', sa.Float(), nullable=True),
        sa.Column('platform_profit', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    # Add index for faster queries
    op.create_index(op.f('ix_withdrawal_requests_account_id'), 'withdrawal_requests', ['account_id'], unique=False)
    op.create_index(op.f('ix_withdrawal_requests_created_at'), 'withdrawal_requests', ['created_at'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_withdrawal_requests_created_at'), table_name='withdrawal_requests')
    op.drop_index(op.f('ix_withdrawal_requests_account_id'), table_name='withdrawal_requests')
    op.drop_table('withdrawal_requests') 