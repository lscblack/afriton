"""add location column final

Revision ID: add_location_column_final_rev
Revises: create_withdrawal_requests
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision = 'add_location_column_final_rev'
down_revision = 'create_withdrawal_requests'  # Make sure this matches your last successful migration
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Check if column exists first
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'location' not in columns:
        # Add location column
        op.add_column('users', sa.Column('location', sa.String(255), nullable=True))
        
        # Set default value for existing records
        op.execute(text("UPDATE users SET location = 'Not specified' WHERE location IS NULL"))

def downgrade() -> None:
    # Check if column exists before dropping
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'location' in columns:
        op.drop_column('users', 'location') 