# Docker Compose Files - Usage Guide

This folder contains three docker-compose files for different deployment scenarios.

## 📁 Files

1. **docker-compose.yml** - Full stack (Backend + Frontend + RTMP + DB) - All in Docker
2. **docker-compose.public.yml** - Full stack using public Docker images
3. **docker-compose-only-rtmp-db.yml** - RTMP + DB only (Backend/Frontend run locally)

## 🚀 Usage

### Full Stack (All in Docker)

```bash
cd infra
cp env.docker-compose.yml.example .env
docker-compose up -d
```

### Public Images (Full Stack)

```bash
cd infra
cp env.docker-compose.public.yml.example .env
docker-compose -f docker-compose.public.yml up -d
```

### RTMP + DB Only (Backend/Frontend Local)

```bash
cd infra
cp env.docker-compose-only-rtmp-db.yml.example .env
docker-compose -f docker-compose-only-rtmp-db.yml up -d

# Then run backend and frontend locally:
# Backend: cd ../backend && npm run dev
# Frontend: cd ../frontend && npm run dev
```

## 🔒 CORS Configuration for Local Development

When running backend and frontend locally (not in Docker):

### Backend Configuration
Set in `backend/.env`:
```bash
CORS_ORIGIN=http://localhost:3000
```

### How It Works
- **Frontend** runs on `http://localhost:3000`
- **Backend** runs on `http://localhost:4000`
- Backend CORS allows requests from `http://localhost:3000`
- ✅ **No CORS issues** - both on same origin (localhost)

### Multiple Origins
If you need to access from different URLs:
```bash
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.100:3000
```

## 📝 Environment Files

Each docker-compose file has its own `.env.example`:
- `env.docker-compose.yml.example` - For full stack
- `env.docker-compose.public.yml.example` - For public images
- `env.docker-compose-only-rtmp-db.yml.example` - For RTMP+DB only

Copy the appropriate one to `.env` before running.

