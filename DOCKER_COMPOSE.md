# 🐳 Docker Compose Setup

**One command to run everything!**

---

## 🚀 Quick Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## 📋 What Gets Started

1. **PostgreSQL** - Database on port `5432`
2. **Backend** - API on port `4000`
3. **Frontend** - Next.js on port `3000`
4. **RTMP Server** - Streaming on port `1935` (RTMP) and `8080` (HLS)

---

## 🔗 Access Your Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **RTMP Server**: rtmp://localhost:1935/live
- **HLS Streams**: http://localhost:8080/hls
- **Database**: localhost:5432

---

## ⚙️ Environment Variables

**All variables have defaults** - you can run without .env file!

To customize, create a `.env` file:

```bash
# Copy sample file
cp sample.env .env

# Edit as needed
nano .env
```

**Available variables** (see `sample.env` for all options):
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`
- `BACKEND_PORT`, `JWT_SECRET`, `COOKIE_SECRET`, `NODE_ENV`, `CORS_ORIGIN`
- `FRONTEND_PORT`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_HLS_URL`
- `RTMP_PORT`, `HLS_PORT`

**Default values are in docker-compose.yml** - only override what you need!

---

## 🔄 Common Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build

# Stop all services
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

---

## 🗄️ Database

**First time setup:**
```bash
# Migrations run automatically on backend startup
# But you can run manually:
docker-compose exec backend npx prisma migrate deploy
```

**Access database:**
```bash
docker-compose exec postgres psql -U gostream -d gostream
```

---

## 🎥 Test Streaming

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Open frontend:**
   - Go to http://localhost:3000
   - Create account
   - Create project
   - Copy stream key

3. **Configure OBS:**
   - Server: `rtmp://localhost:1935/live`
   - Stream Key: `[your-project-stream-key]`

4. **Start streaming!**

---

## 🐛 Troubleshooting

### **Backend won't start:**
```bash
# Check logs
docker-compose logs backend

# Check database connection
docker-compose exec backend npx prisma migrate deploy
```

### **Frontend can't connect to backend:**
```bash
# Verify backend is running
curl http://localhost:4000/health

# Check environment variables
docker-compose exec frontend env | grep NEXT_PUBLIC
```

### **RTMP not working:**
```bash
# Check RTMP logs
docker-compose logs rtmp

# Test RTMP connection
ffmpeg -re -i test.mp4 -c copy -f flv rtmp://localhost:1935/live/test
```

### **Port already in use:**
```bash
# Change ports in docker-compose.yml
# Or stop the conflicting service
```

---

## 📊 Service Health

```bash
# Check all services
docker-compose ps

# Check specific service
docker-compose ps backend
```

---

## 🔄 Update Code

```bash
# After making code changes:
docker-compose up -d --build

# Or rebuild specific service:
docker-compose build backend
docker-compose up -d backend
```

---

## 💾 Data Persistence

- **PostgreSQL data**: Stored in `postgres_data` volume
- **HLS files**: Stored in `rtmp_hls` volume

**To backup:**
```bash
docker-compose exec postgres pg_dump -U gostream gostream > backup.sql
```

**To restore:**
```bash
docker-compose exec -T postgres psql -U gostream gostream < backup.sql
```

---

## 🎯 That's It!

**One command to rule them all:**
```bash
docker-compose up -d
```

Everything is now running! 🎉

