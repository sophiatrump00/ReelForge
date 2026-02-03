import logging
import time
import socket
import os
import subprocess
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def wait_for_postgres(host="postgres", port=5432, timeout=60):
    logger.info("Waiting for PostgreSQL...")
    start_time = time.time()
    while True:
        try:
            with socket.create_connection((host, port), timeout=1):
                logger.info("PostgreSQL started")
                return True
        except (socket.timeout, socket.error):
            if time.time() - start_time > timeout:
                logger.error("Timeout waiting for PostgreSQL")
                sys.exit(1)
            time.sleep(1)

def run_alembic_migrations():
    logger.info("Running Alembic migrations...")
    backend_dir = "/app/backend"
    try:
        subprocess.run(["alembic", "upgrade", "head"], cwd=backend_dir, check=True)
        logger.info("Migrations completed")
    except subprocess.CalledProcessError as e:
        logger.error(f"Alembic migrations failed: {e}")
        sys.exit(1)

def main():
    # 1. Wait for Postgres
    wait_for_postgres()

    # 2. Init DB (SQLAlchemy create_all)
    logger.info("Initializing databases...")
    try:
        from backend.db.init_db import init_db
        init_db()
    except Exception as e:
        logger.error(f"Failed to init db: {e}")
        sys.exit(1)

    # 3. Run Migrations
    run_alembic_migrations()

    # 4. Init Data (Settings/Keywords from JSON)
    logger.info("Initializing data...")
    try:
        from backend.scripts.init_data import init_data
        init_data()
    except Exception as e:
        logger.error(f"Failed to init data: {e}")
        sys.exit(1)

    logger.info("Initialization complete. Exiting.")

if __name__ == "__main__":
    main()
