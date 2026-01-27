# Import all the models, so that Base has them before being
# imported by Alembic or init_db
from backend.db.session import Base
from backend.models.material import Material
