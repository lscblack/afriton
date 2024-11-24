"""add location to users

Revision ID: add_location_to_users_column
Revises: your_previous_revision_id
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_location_to_users_column'
down_revision = 'your_previous_revision_id'  # Replace with your last revision ID
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add location column
    op.add_column('users', sa.Column('location', sa.String(255), nullable=True))
    
    # Set default value for existing records
    op.execute("UPDATE users SET location = 'default' WHERE location IS NULL")

def downgrade() -> None:
    # Remove location column
    op.drop_column('users', 'location') 