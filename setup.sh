#!/bin/bash

echo "🔧 Setting up ReelForge..."

# 1. Fix permissions (frontend init caused root ownership)
echo "Checking frontend permissions..."
if [ -d "frontend" ] && [ ! -w "frontend" ]; then
    echo "⚠️  Frontend directory is not writable by current user."
    echo "    Please run: sudo chown -R \$USER:\$USER frontend"
    echo "    Then move Dockerfile: mv frontend_Dockerfile frontend/Dockerfile"
    echo "    Then uncomment 'frontend' service in docker-compose.yml"
fi

if [ -f "frontend_Dockerfile" ] && [ -d "frontend" ]; then
    echo "⚠️  Found stray Dockerfile. Attempting to restore..."
    mv frontend_Dockerfile frontend/Dockerfile 2>/dev/null || echo "    ❌ Failed (Permissions). Please move it manually."
fi

# 2. Start services
echo "🚀 Starting Docker containers (Backend Only if Frontend disabled)..."
docker compose up -d --build

# 2.5 Ensure Frontend Dependencies (Fix for missing npm on host)
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 'frontend/node_modules' is missing."
    if command -v npm &> /dev/null; then
        echo "   Running 'npm install' locally..."
        cd frontend && npm install && cd ..
    else
        echo "   'npm' not found on host. Using Docker wrapper to install..."
        ./scripts/npm.sh install
    fi
fi

# 3. Wait and Test
echo "⏳ Waiting for services to initialize..."
echo "   (This may take a minute for Database and API to come online)..."
sleep 15
python3 tests/test_api.py

echo "
✅ Setup Process Finished!

Backend API: http://localhost:8000/docs
Prefect UI:  http://localhost:4200

👉 Frontend Note: 
   If Frontend service is disabled/missing, please fix permissions and enable it in docker-compose.yml.
   Then run 'docker compose up -d frontend'
"
