"""add location to users v3

Revision ID: add_location_to_users_v3
Revises: create_withdrawal_requests
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_location_to_users_v3'
down_revision = 'create_withdrawal_requests'  # Make sure this matches your last migration
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add location column if it doesn't exist
    try:
        op.add_column('users', sa.Column('location', sa.String(255), nullable=True))
        # Set default value for existing records
        op.execute("UPDATE users SET location = 'Not specified' WHERE location IS NULL")
    except Exception as e:
        print(f"Error adding location column: {str(e)}")
        # If column already exists, just update NULL values
        op.execute("UPDATE users SET location = 'Not specified' WHERE location IS NULL")

def downgrade() -> None:
    try:
        # Remove location column
        op.drop_column('users', 'location')
    except Exception as e:
        print(f"Error dropping location column: {str(e)}") 