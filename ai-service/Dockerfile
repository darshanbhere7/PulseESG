FROM python:3.11-slim

# Prevent Python from writing pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps (required for torch & spacy)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better caching)
COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Render provides PORT automatically
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
