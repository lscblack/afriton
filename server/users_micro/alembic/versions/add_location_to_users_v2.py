"""add location to users v2

Revision ID: add_location_to_users_v2
Revises: create_withdrawal_requests
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_location_to_users_v2'
down_revision = 'create_withdrawal_requests'  # Update this to your last migration
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Check if column exists first
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'location' not in columns:
        # Add location column if it doesn't exist
        op.add_column('users', sa.Column('location', sa.String(255), nullable=True))
        # Set default value for existing records
        op.execute("UPDATE users SET location = 'Not specified' WHERE location IS NULL")

def downgrade() -> None:
    # Remove location column
    op.drop_column('users', 'location') 