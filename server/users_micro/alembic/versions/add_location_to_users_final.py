"""add location to users final

Revision ID: add_location_to_users_final
Revises: create_withdrawal_requests
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_location_to_users_final'
down_revision = 'create_withdrawal_requests'  # Make sure this matches your last migration
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Drop existing location column if it exists
    try:
        op.drop_column('users', 'location')
    except Exception:
        pass

    # Add location column
    op.add_column('users', sa.Column('location', sa.String(255), nullable=True, server_default='Not specified'))

def downgrade() -> None:
    op.drop_column('users', 'location') 