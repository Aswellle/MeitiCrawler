# ============================================================
# MeitiCrawler - Railway Deployment Dockerfile
# Based on official Playwright Python image (Ubuntu 24.04 noble)
# ============================================================

FROM mcr.microsoft.com/playwright/python:v1.61.0-noble

# Prevent Python from writing pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Tell Playwright where browsers are installed in the official image
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    # Railway-specific: increase /dev/shm for Chromium (set via Railway dashboard too)
    RAILWAY_SHM_SIZE_BYTES=1073741824

WORKDIR /app

# ---------- System dependencies for Playwright ----------
# The official image already includes them, but this ensures any
# secondary packages that need rebuild work correctly.
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# ---------- Install Python dependencies ----------
# Copy only dependency manifests first (layer caching)
COPY pyproject.toml requirements.txt ./

# Install via pip (Railway's default package manager inside containers)
# -r requirements.txt is the authoritative list; pyproject.toml is for local uv dev
RUN pip install --no-cache-dir -r requirements.txt

# ---------- Install Playwright browser ----------
# Pre-download Chromium into the image so first request isn't slow
RUN playwright install --with-deps chromium

# ---------- Copy application code ----------
COPY . .

# ---------- Persistence volume ----------
# Railway mounts a volume here. All mutable data must live under /app/data.
# config/base_config.py writes SAVE_DATA_PATH to data/ by default.
RUN mkdir -p /app/data /app/browser_data
VOLUME ["/app/data"]

# ---------- Environment defaults (overridable in Railway dashboard) ----------
ENV PLATFORM=xhs \
    CRAWLER_TYPE=search \
    LOGIN_TYPE=qrcode \
    SAVE_DATA_OPTION=jsonl \
    ENABLE_CDP_MODE=False \
    HEADLESS=True \
    SAVE_DATA_PATH=/app/data \
    PORT=8080

# ---------- Health check ----------
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/api/health')" || exit 1

# ---------- Expose port ----------
EXPOSE 8080

# ---------- Entry point ----------
# Start FastAPI (the WebUI backend). The backend spawns crawler sub-processes internally.
# Use 0.0.0.0 so Railway's reverse proxy can reach the container.
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT}"]
