#!/bin/bash
set -e

# Wait for postgres
echo "Waiting for PostgreSQL..."
python -c "import socket, time; 
while True: 
    try: 
        with socket.create_connection(('postgres', 5432), timeout=1): break 
    except: 
        time.sleep(1)"
echo "PostgreSQL started"

# Init DB
echo "Initializing databases..."
ls -R /app/backend/db/ || echo "Directory /app/backend/db/ MISSING"
# Use absolute path/module for init_db to be safe or relative if we cd
python /app/backend/db/init_db.py

# Switch to backend directory for Alembic and App execution
cd /app/backend

# Run migrations
echo "Running Alembic migrations..."
# alembic.ini is in /app/backend, so we can just run alembic
alembic upgrade head

# Initialize Data (Migrate JSON to DB)
echo "Initializing data..."
python scripts/init_data.py

# Start app
echo "Starting FastAPI..."
# Run from within backend package, but keep pythonpath set to /app so 'backend' module is resolvable
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
