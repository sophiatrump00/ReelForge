import logging
from backend.db.session import engine
from backend.db.base import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creating initial tables")
    Base.metadata.create_all(bind=engine)
    logger.info("Initial tables created")

if __name__ == "__main__":
    init_db()
