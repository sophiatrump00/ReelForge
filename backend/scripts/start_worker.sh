#!/bin/bash

# Wait for Prefect Server to be ready
echo "Waiting for Prefect Server..."
sleep 10

# Register deployments
# This ensures flows are available to the worker
echo "Registering flows..."
python -c "from backend.workers.download_flow import video_download_flow; video_download_flow.to_deployment(name='api_triggered').apply()"

# Start the worker
echo "Starting Prefect Worker..."
prefect worker start --pool default-agent-pool --type process
