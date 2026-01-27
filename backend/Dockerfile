FROM python:3.11-slim

# Install system dependencies
# ffmpeg is crucial for video processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app/backend

# Create data directories (in case volume mapping fails or for permissions)
RUN mkdir -p /app/data/raw /app/data/output /app/data/temp

# Environment variables
ENV PYTHONPATH=/app

# Command is specified in docker-compose.yml
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
