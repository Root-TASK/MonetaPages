# ── Build Stage ──────────────────────────────────────────────────
FROM python:3.12-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Final Stage ──────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY . .

# Ensure database and uploads directories exist
RUN mkdir -p /app/data /app/uploads

EXPOSE 8008

# Use $PORT environment variable, defaulting to 8008
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8008}"]
