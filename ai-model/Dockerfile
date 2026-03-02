FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY energy_predictor.py .
COPY model.pt . 2>/dev/null || :

# Expose port
EXPOSE 8083

# Run the application
CMD ["uvicorn", "energy_predictor:app", "--host", "0.0.0.0", "--port", "8083"]
