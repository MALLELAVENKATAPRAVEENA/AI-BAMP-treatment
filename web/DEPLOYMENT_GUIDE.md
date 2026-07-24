# Deployment Guide

## Production Deployment with Docker Compose

1. **Build and Run Containers**:
   ```bash
   cd web
   docker-compose up --build -d
   ```

2. **Verify Services**:
   - Frontend: `http://localhost` (Port 80)
   - Backend API: `http://localhost:5000`
   - AI FastAPI Service: `http://localhost:8000`

3. **Production Logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Nginx Reverse Proxy**:
   Custom Nginx configuration handles routing single-page app routes to `index.html` and proxies `/api/*` requests directly to the Node backend.
