# GoStream - Multi-Streaming Platform

Stream to **multiple destinations simultaneously** from a single source. Support for **10+ platforms** including YouTube, Twitch, Facebook, LinkedIn, TikTok, Instagram, and custom RTMP endpoints.

## 🌟 Key Features

- **🎯 Multi-Destination Streaming**: Stream to unlimited destinations at once
- **📺 Multiple Platform Accounts**: Broadcast to multiple YouTube channels, Facebook pages, Twitch accounts, etc.
- **🎮 Individual Controls**: Start/stop streams per destination independently
- **👁️ Live Preview**: Monitor your stream in real-time with HLS player
- **🚀 Production Ready**: Enterprise-grade security and scalability foundation

Perfect for **content creators**, **agencies**, **businesses**, and **broadcasters** who need to reach multiple audiences simultaneously.

## 💡 Use Cases

### For Content Creators
- **Multi-Channel Strategy**: Stream to your main YouTube channel + gaming channel + backup channel
- **Cross-Platform Presence**: Broadcast to YouTube, Twitch, TikTok, and Instagram simultaneously
- **Brand Partnerships**: Stream to your channel + brand collaboration channels

### For Agencies & Businesses
- **Client Campaigns**: Stream to multiple client YouTube channels at once
- **Multi-Location Events**: Broadcast corporate events to several Facebook pages
- **Training Sessions**: Deliver webinars to multiple LinkedIn groups simultaneously

### For Broadcasters
- **Redundancy**: Stream to primary + backup destinations
- **Global Reach**: Broadcast to regional YouTube channels worldwide
- **Platform Migration**: Test streaming to new platforms while maintaining current audience

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
  --name gostream-postgres \
  -e POSTGRES_USER=gostream \
  -e POSTGRES_PASSWORD=gostream_secret_2024 \
  -e POSTGRES_DB=gostream \
  -p 5432:5432 \
  postgres:15-alpine

# Start Nginx-RTMP
docker run -d \
  --name gostream-nginx-rtmp \
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

### 5. Add Multiple Destinations
- Click "+ Add Destination" multiple times
- Select platform (YouTube, Twitch, Facebook, LinkedIn, TikTok, Instagram, etc.)
- Enter RTMP URL and Stream Key for each destination
- **Stream to multiple accounts of the same platform simultaneously**
  - Multiple YouTube channels
  - Multiple Facebook pages/groups
  - Multiple Twitch accounts
- Save all destinations

### 6. Multi-Stream Control
- **"Start All Streams"** button to broadcast to all destinations at once
- **Individual controls** to start/stop specific destinations
- **Real-time status** for each destination
- **Stream preview** to monitor your broadcast

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
- **Streaming**: Nginx-RTMP (ingestion), FFmpeg (multi-destination relay), HLS (preview)
- **Auth**: JWT + bcrypt, Google OAuth
- **Multi-Streaming**: FFmpeg process management for simultaneous broadcasting

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

### Multi-Streaming
- `POST /api/destinations/:id/relay/start` - Start stream to destination
- `POST /api/destinations/:id/relay/stop` - Stop stream to destination
- `GET /api/destinations/:id/relay/status` - Get relay status
- `GET /api/relays` - Get all active relays

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
4. Restart nginx: `docker restart gostream-nginx-rtmp`

### Preview not showing

- Wait 10-15 seconds (HLS needs time)
- Refresh the page
- Check OBS is streaming (green indicator)

### Multi-streaming issues

- **Individual destinations not starting**: Check RTMP URL and stream key for each destination
- **Some platforms work, others don't**: Verify platform-specific RTMP URLs and authentication
- **High resource usage**: Each active stream uses ~50-100MB RAM - monitor system resources
- **Stream delays**: Different platforms may have 10-30 second delays for stream processing

---

## 🛑 Stop Services

```bash
# Stop containers
docker stop gostream-postgres
docker stop gostream-nginx-rtmp

# Remove containers
docker rm gostream-postgres
docker rm gostream-nginx-rtmp

# Stop backend and frontend: Ctrl+C in terminals
```

---

## 📚 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://gostream:gostream_secret_2024@localhost:5432/gostream
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

## 🚢 CI/CD & Docker Hub

This project includes automated CI/CD using GitHub Actions to build and push Docker images to Docker Hub.

### Quick Setup

1. **Create Docker Hub Access Token**
   - Go to Docker Hub → Account Settings → Security
   - Create a new access token

2. **Add GitHub Secrets**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add `DOCKER_HUB_USERNAME` (your Docker Hub username)
   - Add `DOCKER_HUB_TOKEN` (the access token you created)

3. **Push to GitHub**
   - Images are automatically built and pushed on push to `main`/`master`
   - Images are tagged with `latest`, branch name, and version tags

📖 **Full CI/CD Setup Guide**: See [.github/CI_CD_SETUP.md](.github/CI_CD_SETUP.md)

### Docker Images

Images are available on Docker Hub as:
- `your-username/gostream-backend`
- `your-username/gostream-frontend`
- `your-username/gostream-nginx-rtmp`

---

## 🎯 Current Features

### ✅ Core Features (Phase 1)
- User authentication (email/password + Google OAuth)
- Project management with unique stream keys
- RTMP ingestion from OBS/Streamlabs
- HLS preview with real-time streaming
- Modern responsive UI with Tailwind CSS

### ✅ Multi-Streaming Features (Phase 2 - Complete)
- **Multi-destination streaming** to 10+ platforms simultaneously
- **FFmpeg relay** to multiple destinations (YouTube, Twitch, Facebook, etc.)
- **Individual start/stop controls** per destination
- **Platform support**: YouTube, Twitch, Facebook, LinkedIn, TikTok, Instagram, Kick, Rumble, Trovo, Custom RTMP
- **Multiple accounts per platform** (e.g., 3 YouTube channels, 2 Facebook pages)
- **Real-time stream status** monitoring
- **Stream preview** with HLS player

## 🚧 Future Enhancements (Phase 3)

- [ ] Stream analytics and viewer metrics
- [ ] Cloud recording and storage
- [ ] Multi-bitrate adaptive streaming
- [ ] Stream scheduling and automation
- [ ] Team collaboration features
- [ ] API integrations for external tools

---

## 📄 License

MIT

---

**Built with ❤️ for streamers**
