# 🚀 GoStream - Quick Deploy with Docker

Deploy GoStream in minutes using pre-built Docker images!

## 📋 Prerequisites

- **Docker** and **Docker Compose** installed
- That's it! No need to build anything.

## 🚀 Quick Start

### Step 1: Download Files

Download these files to a folder:
- `docker-compose.public.yml`
- `env.public.example` (optional - for network access configuration)

### Step 2: Setup Environment (Optional)

```bash
# Copy the example env file (optional - works without it!)
cp env.public.example .env

# Edit .env if you need network access
nano .env
```

**Minimal configuration** - Works out of the box! Only configure if you want network access:
```bash
# For localhost only (default) - no .env file needed!

# For network access, set these in .env (replace 192.168.1.100 with your IP):
NEXT_PUBLIC_API_URL=http://192.168.1.100:4000
NEXT_PUBLIC_HLS_URL=http://192.168.1.100:8080/hls
CORS_ORIGIN=http://192.168.1.100:3000
RTMP_SERVER_URL=rtmp://192.168.1.100:1935/live
```

### Step 3: Start Everything

```bash
# Start all services
docker-compose -f docker-compose.public.yml up -d

# View logs
docker-compose -f docker-compose.public.yml logs -f

# Stop everything
docker-compose -f docker-compose.public.yml down
```

## 🌐 Access Your Services

Once started, access:

- **Frontend**: http://localhost:3000 (or http://YOUR_IP:3000)
- **Backend API**: http://localhost:4000
- **RTMP Server**: rtmp://localhost:1935/live (or rtmp://YOUR_IP:1935/live)
- **HLS Streams**: http://localhost:8080/hls

## 📝 What Gets Started

1. **PostgreSQL** - Database (port 5432)
2. **Backend** - API server (port 4000)
3. **Frontend** - Web interface (port 3000)
4. **RTMP Server** - Streaming server (ports 1935, 8080)

## 🔧 Configuration

### Required

- **Nothing!** Works out of the box with defaults.

### Optional (for network access)

Set these in `.env` if you want to access from other devices:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_HLS_URL` - HLS streaming URL
- `CORS_ORIGIN` - Frontend origin for CORS
- `RTMP_SERVER_URL` - RTMP server URL

### Optional (all have defaults)

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`
- `BACKEND_PORT`, `FRONTEND_PORT`
- `RTMP_PORT`, `HLS_PORT`
- `JWT_SECRET`, `COOKIE_SECRET`

## 📖 Common Commands

```bash
# Start services
docker-compose -f docker-compose.public.yml up -d

# View logs
docker-compose -f docker-compose.public.yml logs -f

# View specific service
docker-compose -f docker-compose.public.yml logs -f backend
docker-compose -f docker-compose.public.yml logs -f frontend

# Restart a service
docker-compose -f docker-compose.public.yml restart backend

# Stop all services
docker-compose -f docker-compose.public.yml down

# Stop and remove all data
docker-compose -f docker-compose.public.yml down -v
```

## 🎯 First Time Setup

1. Start the services (see Quick Start above)
2. Wait ~30 seconds for everything to initialize
   - Database will start
   - Backend will automatically run migrations (creates tables)
   - All services will be ready
3. Open http://localhost:3000 in your browser
4. Create an account and start streaming!

**Note:** Migrations run automatically - no need to install Prisma locally! Everything is included in the Docker images.

## 🔒 Security Note

The default secrets are for **development only**. For production:
- Generate new `JWT_SECRET`: `openssl rand -base64 32`
- Generate new `COOKIE_SECRET`: `openssl rand -base64 32`
- Change `POSTGRES_PASSWORD` to a strong password

## 🐛 Troubleshooting

**Services won't start?**
```bash
# Check logs
docker-compose -f docker-compose.public.yml logs

# Check if ports are in use
netstat -an | grep -E '3000|4000|5432|1935|8080'
```

**Can't access from other devices?**
- Create `.env` file and set URLs with your machine's IP address (see Step 2)
- Make sure firewall allows ports 3000, 4000, 1935, 8080

**Database connection errors?**
- Wait a bit longer - database takes ~10 seconds to start
- Check logs: `docker-compose -f docker-compose.public.yml logs postgres`

## 📦 Docker Images Used

- `shuhaibs/gostream-frontend:latest`
- `shuhaibs/gostream-backend:latest`
- `shuhaibs/gostream-nginx-rtmp:latest`
- `postgres:15-alpine`

## 💡 Tips

- Use `docker-compose -f docker-compose.public.yml ps` to see running services
- Use `docker-compose -f docker-compose.public.yml pull` to update images
- Data persists in Docker volumes - use `down -v` to start fresh

---

**Need help?** Check the main README.md for more details.

