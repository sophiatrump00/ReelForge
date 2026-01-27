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
# Init DB
echo "Initializing databases..."
ls -R /app/backend/db/ || echo "Directory /app/backend/db/ MISSING"
python /app/backend/db/init_db.py

# Run migrations (todo)
# alembic upgrade head

# Start app
echo "Starting FastAPI..."
exec uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
