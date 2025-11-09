# StreamBridge - Multi-Streaming Platform

Stream to multiple platforms (YouTube, Twitch, Facebook) simultaneously from a single source.

## 🚀 Quick Start (Local Development)

> 📖 **Detailed Setup Guide**: See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for complete step-by-step instructions

### Prerequisites

- Node.js 20+
- Docker Desktop
- PostgreSQL (via Docker)

### 1. Start Database & RTMP Server

```bash
# Start PostgreSQL
docker run -d \
  --name streambridge-postgres \
  -e POSTGRES_USER=streambridge \
  -e POSTGRES_PASSWORD=streambridge_secret_2024 \
  -e POSTGRES_DB=streambridge \
  -p 5432:5432 \
  postgres:15-alpine

# Start Nginx-RTMP
docker run -d \
  --name streambridge-nginx-rtmp \
  -p 1935:1935 \
  -p 8080:8080 \
  -v $(pwd)/infra/nginx-rtmp/nginx.conf:/etc/nginx/nginx.conf \
  tiangolo/nginx-rtmp
```

### 2. Setup Backend

```bash
cd backend

# Copy example env file
cp env.example .env

# Install dependencies
npm install

# Run migrations
npx prisma generate
npx prisma migrate deploy

# Start backend
npm run dev
```

Backend runs on: **http://localhost:4000**

### 3. Setup Frontend

```bash
cd frontend

# Copy example env file
cp env.example .env.local

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 📖 Usage

### 1. Create Account
- Go to http://localhost:3000
- Sign up with email and password

### 2. Create Project
- Click "+ New Project"
- Enter project name
- Get your unique stream key

### 3. Stream with OBS

**OBS Settings → Stream:**
```
Service: Custom
Server: rtmp://localhost/live
Stream Key: [your-project-stream-key]
```

Click "Start Streaming" in OBS

### 4. View Preview
- Go to your project page
- Wait 10-15 seconds
- Stream preview appears

### 5. Add Destinations
- Click "+ Add Destination"
- Select platform (YouTube, Twitch, Facebook, Custom)
- Enter RTMP URL and Stream Key
- Save destination

---

## 🏗️ Project Structure

```
gostream/
├── backend/          # Node.js + Express + Prisma
├── frontend/         # Next.js + React + TailwindCSS
└── infra/            # Docker configs + Nginx RTMP
```

## 🔧 Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Frontend**: Next.js 14, React, TailwindCSS
- **Database**: PostgreSQL 15
- **Streaming**: Nginx-RTMP, HLS
- **Auth**: JWT + bcrypt

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `DELETE /api/projects/:id` - Delete project

### Destinations
- `POST /api/projects/:projectId/destinations` - Add destination
- `PUT /api/projects/destinations/:id` - Update destination
- `DELETE /api/projects/destinations/:id` - Delete destination

---

## 🗄️ Database Schema

```
users
  ├── id (UUID)
  ├── email (unique)
  ├── passwordHash
  └── timestamps

projects
  ├── id (UUID)
  ├── name
  ├── streamKey (unique)
  ├── userId (FK)
  └── timestamps

streams
  ├── id (UUID)
  ├── projectId (FK)
  ├── status (live/ended)
  └── timestamps

destinations
  ├── id (UUID)
  ├── projectId (FK)
  ├── platform
  ├── name
  ├── rtmpUrl
  ├── streamKey
  ├── enabled
  └── timestamps
```

---

## 🔍 Troubleshooting

### Backend won't start

Check database is running:
```bash
docker ps | grep postgres
```

Verify DATABASE_URL in `backend/.env`

### Stream won't connect

1. Make sure backend is running
2. Verify stream key is correct
3. Check nginx config uses `host.docker.internal` for local dev
4. Restart nginx: `docker restart streambridge-nginx-rtmp`

### Preview not showing

- Wait 10-15 seconds (HLS needs time)
- Refresh the page
- Check OBS is streaming (green indicator)

---

## 🛑 Stop Services

```bash
# Stop containers
docker stop streambridge-postgres
docker stop streambridge-nginx-rtmp

# Remove containers
docker rm streambridge-postgres
docker rm streambridge-nginx-rtmp

# Stop backend and frontend: Ctrl+C in terminals
```

---

## 📚 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://streambridge:streambridge_secret_2024@localhost:5432/streambridge
JWT_SECRET=your-secret-key
PORT=4000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_HLS_URL=http://localhost:8080/hls
```

---

## 🎯 Phase 1 Complete

✅ User authentication  
✅ Project management  
✅ RTMP ingestion  
✅ HLS preview  
✅ Destination management  
✅ Modern UI  

## 🚧 Phase 2 (Coming)

- [ ] FFmpeg relay to multiple destinations
- [ ] Start/Stop controls per destination
- [ ] Stream analytics
- [ ] Recording to storage
- [ ] Multi-bitrate streaming

---

## 📄 License

MIT

---

**Built with ❤️ for streamers**
