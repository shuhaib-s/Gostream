# Local Development Setup Guide

Complete guide to run StreamBridge locally for development.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 20+** installed
- ✅ **Docker Desktop** installed and running
- ✅ **Git** (for cloning)
- ✅ **Terminal/Command Line** access

---

## 🚀 Step-by-Step Setup

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd gostream
```

---

### Step 2: Setup Environment Files

Copy the example environment files to create your local configuration:

```bash
# Backend environment file
cd backend
cp env.example .env
cd ..

# Frontend environment file
cd frontend
cp env.example .env.local
cd ..

# Infrastructure environment file (for Docker Compose - optional)
cd infra
cp env.example .env
cd ..
```

**What these files contain:**
- `backend/.env` - Database URL, JWT secret, port
- `frontend/.env.local` - API URL, HLS streaming URL
- `infra/.env` - Docker Compose variables (only needed if using docker-compose)

---

### Step 3: Start Docker Containers

You need **2 Docker containers** running:

#### Container 1: PostgreSQL Database

```bash
docker run -d \
  --name streambridge-postgres \
  -e POSTGRES_USER=streambridge \
  -e POSTGRES_PASSWORD=streambridge_secret_2024 \
  -e POSTGRES_DB=streambridge \
  -p 5432:5432 \
  postgres:15-alpine
```

**What this does:**
- Creates PostgreSQL database container
- Exposes port 5432 on your machine
- Database name: `streambridge`
- Username: `streambridge`
- Password: `streambridge_secret_2024`

**Verify it's running:**
```bash
docker ps | grep streambridge-postgres
```

Should show the container as "Up".

---

#### Container 2: Nginx-RTMP Server

```bash
docker run -d \
  --name streambridge-nginx-rtmp \
  -p 1935:1935 \
  -p 8080:8080 \
  -v $(pwd)/infra/nginx-rtmp/nginx.conf:/etc/nginx/nginx.conf \
  tiangolo/nginx-rtmp
```

**What this does:**
- Creates Nginx-RTMP container for receiving streams
- Port 1935: RTMP ingestion (OBS connects here)
- Port 8080: HLS output (browser preview)
- Mounts your nginx.conf file

**Verify it's running:**
```bash
docker ps | grep streambridge-nginx-rtmp
```

Should show the container as "Up".

---

### Step 4: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations (creates tables)
npx prisma migrate deploy

# Start backend server
npm run dev
```

**Backend will start on:** `http://localhost:4000`

**You should see:**
```
═══════════════════════════════════════════════════════════
🚀 StreamBridge Backend Starting...
═══════════════════════════════════════════════════════════

📋 Environment Configuration:
   NODE_ENV: development
   PORT: 4000

✅ JWT_SECRET: Loaded
   Length: 64 characters

✅ DATABASE_URL: Loaded
   postgresql://streambridge:***@localhost:5432/streambridge

🔌 Testing database connection...
✅ Database: Connected successfully
✅ Database: Tables verified

═══════════════════════════════════════════════════════════
✅ Server Ready!
═══════════════════════════════════════════════════════════

🌐 Server running on: http://localhost:4000
📡 Health check: http://localhost:4000/health
```

**Keep this terminal open** - backend is running here.

---

### Step 5: Setup Frontend

Open a **new terminal window/tab**:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

**Frontend will start on:** `http://localhost:3000`

**You should see:**
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Ready in 2.1s
```

**Keep this terminal open** - frontend is running here.

---

## ✅ Verify Everything is Running

### Check All Services

```bash
# Check Docker containers
docker ps

# Should show:
# - streambridge-postgres (port 5432)
# - streambridge-nginx-rtmp (ports 1935, 8080)

# Check backend
curl http://localhost:4000/health
# Should return: {"status":"ok"}

# Check frontend
open http://localhost:3000
# Browser should open with landing page
```

---

## 🎯 You Should Have Running:

| Service | Port | Status Check |
|---------|------|--------------|
| **PostgreSQL** | 5432 | `docker ps \| grep postgres` |
| **Nginx-RTMP** | 1935, 8080 | `docker ps \| grep nginx-rtmp` |
| **Backend** | 4000 | `curl http://localhost:4000/health` |
| **Frontend** | 3000 | Open http://localhost:3000 |

---

## 📝 Development Workflow

### Terminal Setup

You should have **3 terminal windows/tabs** open:

```
Terminal 1: Backend
  $ cd backend
  $ npm run dev
  (Shows backend logs)

Terminal 2: Frontend
  $ cd frontend
  $ npm run dev
  (Shows frontend logs)

Terminal 3: Commands
  $ docker logs -f streambridge-nginx-rtmp
  (View RTMP logs, run other commands)
```

---

## 🔄 Daily Development Routine

### Starting Work

```bash
# 1. Check if Docker containers are running
docker ps

# If not running, start them:
docker start streambridge-postgres
docker start streambridge-nginx-rtmp

# 2. Start backend (terminal 1)
cd backend
npm run dev

# 3. Start frontend (terminal 2)
cd frontend
npm run dev

# 4. Open browser
open http://localhost:3000
```

### Stopping Work

```bash
# 1. Stop backend: Ctrl+C in terminal 1
# 2. Stop frontend: Ctrl+C in terminal 2

# 3. (Optional) Stop Docker containers
docker stop streambridge-postgres
docker stop streambridge-nginx-rtmp
```

---

## 🔧 Useful Commands

### Docker Container Management

```bash
# View all containers
docker ps

# View logs
docker logs streambridge-postgres
docker logs streambridge-nginx-rtmp

# Follow logs (real-time)
docker logs -f streambridge-nginx-rtmp

# Restart containers
docker restart streambridge-postgres
docker restart streambridge-nginx-rtmp

# Stop containers
docker stop streambridge-postgres streambridge-nginx-rtmp

# Remove containers (data will be lost!)
docker rm streambridge-postgres streambridge-nginx-rtmp
```

### Database Commands

```bash
# Connect to database
docker exec -it streambridge-postgres psql -U streambridge -d streambridge

# Inside psql:
\dt                    # List tables
\d users              # Describe users table
SELECT * FROM users;  # Query users
\q                    # Quit

# Reset database (deletes all data!)
cd backend
npx prisma migrate reset
```

### Backend Commands

```bash
cd backend

# Install new package
npm install <package-name>

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# View database in GUI
npx prisma studio
# Opens at http://localhost:5555

# Check types
npx tsc --noEmit
```

### Frontend Commands

```bash
cd frontend

# Install new package
npm install <package-name>

# Check linting
npm run lint

# Build for production
npm run build

# Clear Next.js cache
rm -rf .next
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error: Can't connect to database**

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it
docker start streambridge-postgres

# If doesn't exist, create it (see Step 3)
```

**Error: Database tables don't exist**

```bash
cd backend
npx prisma migrate deploy
```

**Error: Port 4000 already in use**

```bash
# Find what's using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

---

### Frontend won't start

**Error: Port 3000 already in use**

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Error: Can't connect to backend**

```bash
# Make sure backend is running
curl http://localhost:4000/health

# Check .env.local has correct URL
cat frontend/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

### Docker Issues

**Error: Docker daemon not running**

```bash
# Start Docker Desktop application
open -a Docker

# Wait for Docker to start, then try again
```

**Error: Container already exists**

```bash
# Remove existing container
docker rm streambridge-postgres
docker rm streambridge-nginx-rtmp

# Then create again (see Step 3)
```

**Error: Port already allocated**

```bash
# Check what's using the port
lsof -i :5432   # PostgreSQL
lsof -i :1935   # RTMP
lsof -i :8080   # HLS

# Stop local PostgreSQL (if installed)
brew services stop postgresql

# Or change port in docker run command
```

---

### Streaming Issues

**OBS can't connect**

1. Check Nginx is running:
   ```bash
   docker ps | grep nginx-rtmp
   ```

2. Check backend is running:
   ```bash
   curl http://localhost:4000/health
   ```

3. Verify stream key is correct

4. Check nginx config uses `host.docker.internal`:
   ```bash
   cat infra/nginx-rtmp/nginx.conf | grep on_publish
   # Should show: http://host.docker.internal:4000
   ```

5. Restart Nginx:
   ```bash
   docker restart streambridge-nginx-rtmp
   ```

**Stream preview not showing**

1. Wait 10-15 seconds (HLS needs time)
2. Refresh the page
3. Check OBS is streaming (green indicator)
4. Check HLS files exist:
   ```bash
   docker exec streambridge-nginx-rtmp ls -lah /tmp/hls
   ```

---

## 📊 Port Reference

| Port | Service | Purpose |
|------|---------|---------|
| **3000** | Frontend | Web UI |
| **4000** | Backend | API Server |
| **5432** | PostgreSQL | Database |
| **1935** | Nginx-RTMP | RTMP Ingestion (OBS) |
| **8080** | Nginx-RTMP | HLS Output (Preview) |
| **5555** | Prisma Studio | Database GUI (optional) |

---

## 🎯 Quick Setup Checklist

- [ ] Node.js 20+ installed
- [ ] Docker Desktop installed and running
- [ ] Repository cloned
- [ ] Environment files created (backend/.env, frontend/.env.local)
- [ ] PostgreSQL container running
- [ ] Nginx-RTMP container running
- [ ] Backend dependencies installed (npm install)
- [ ] Database migrated (npx prisma migrate deploy)
- [ ] Backend running on port 4000
- [ ] Frontend dependencies installed (npm install)
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can create account and login
- [ ] Can create project and get stream key
- [ ] OBS connects successfully
- [ ] Stream preview works

---

## 🚀 Next Steps After Setup

1. **Create an account** at http://localhost:3000/signup
2. **Create a project** to get your stream key
3. **Configure OBS:**
   - Server: `rtmp://localhost/live`
   - Stream Key: [from your project]
4. **Start streaming** and see preview!
5. **Add destinations** (YouTube, Twitch, etc.)

---

## 📚 Additional Resources

- **Main README**: Setup overview and features
- **DATAFLOW.md**: Architecture and data flow diagrams
- **Backend README**: API documentation (create if needed)
- **Frontend README**: Component documentation (create if needed)

---

## 💡 Pro Tips

1. **Use separate terminals** for backend and frontend - easier to see logs
2. **Keep Docker Desktop open** - easy to see container status
3. **Use Prisma Studio** (`npx prisma studio`) to view/edit database
4. **Watch backend logs** - shows stream validation attempts
5. **Use browser DevTools** - check network requests and console
6. **Save your stream key** - you'll use it in OBS every time

---

## 🔄 Clean Restart (If Everything Breaks)

```bash
# 1. Stop everything
# Backend: Ctrl+C
# Frontend: Ctrl+C

# 2. Remove Docker containers
docker stop streambridge-postgres streambridge-nginx-rtmp
docker rm streambridge-postgres streambridge-nginx-rtmp

# 3. Remove node_modules (optional)
rm -rf backend/node_modules frontend/node_modules

# 4. Start fresh - follow setup from Step 3!
```

---

**You're all set for local development! Happy coding! 🚀**

