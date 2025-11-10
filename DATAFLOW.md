# GoStream - System Architecture & Data Flow

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                              USER INTERFACE                                   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                            FRONTEND (Next.js)                                 │
│                         Port: 3000 (localhost)                                │
│                                                                               │
│  • User Authentication (Login/Signup)                                         │
│  • Project Management (Create/View/Delete)                                    │
│  • Destination Management (YouTube, Twitch, etc.)                             │
│  • HLS Live Preview Player                                                    │
│  • Stream Control Dashboard                                                   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP REST API (JSON)
                                      │ JWT Authentication
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                       BACKEND API (Node.js + Express)                         │
│                         Port: 4000 (localhost)                                │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     API ENDPOINTS                                     │    │
│  │  • POST /api/auth/signup          - User registration                │    │
│  │  • POST /api/auth/login           - User login                       │    │
│  │  • GET  /api/projects             - List projects                    │    │
│  │  • POST /api/projects             - Create project                   │    │
│  │  • GET  /api/projects/:id         - Get project details              │    │
│  │  • POST /api/projects/:id/destinations - Add destination             │    │
│  │  • POST /api/streams/on_publish   - Validate stream key (from Nginx) │    │
│  │  • POST /api/streams/on_publish_done - Stream ended (from Nginx)     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                   SERVICES & LOGIC                                    │    │
│  │  • JWT Token Generation & Verification                                │    │
│  │  • Password Hashing (bcrypt)                                          │    │
│  │  • Stream Key Generation (UUID)                                       │    │
│  │  • Stream Validation                                                  │    │
│  │  • Prisma ORM (Database Access)                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ SQL Queries
                                      │ (Prisma ORM)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                      DATABASE (PostgreSQL 15)                                 │
│                         Port: 5432 (localhost)                                │
│                                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │    users      │  │   projects    │  │    streams    │  │ destinations │ │
│  ├───────────────┤  ├───────────────┤  ├───────────────┤  ├──────────────┤ │
│  │ id            │  │ id            │  │ id            │  │ id           │ │
│  │ email         │  │ name          │  │ projectId     │  │ projectId    │ │
│  │ passwordHash  │  │ streamKey     │  │ status        │  │ platform     │ │
│  │ createdAt     │  │ userId        │  │ startedAt     │  │ name         │ │
│  │ updatedAt     │  │ createdAt     │  │ endedAt       │  │ rtmpUrl      │ │
│  └───────────────┘  └───────────────┘  └───────────────┘  │ streamKey    │ │
│                                                             │ enabled      │ │
│                                                             └──────────────┘ │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                   STREAMING SOURCE (OBS Studio)                               │
│                                                                               │
│  • User configures OBS with:                                                  │
│    - Server: rtmp://localhost/live                                            │
│    - Stream Key: [from project]                                               │
│  • Clicks "Start Streaming"                                                   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ RTMP Protocol
                                      │ Port: 1935
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                     NGINX-RTMP SERVER (Docker)                                │
│                    Ports: 1935 (RTMP), 8080 (HLS)                             │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    STREAM PROCESSING                                  │    │
│  │                                                                       │    │
│  │  1. Receive RTMP stream from OBS                                     │    │
│  │  2. Extract stream key from URL                                      │    │
│  │  3. Call backend webhook to validate:                                │    │
│  │     → POST /api/streams/on_publish?name=<streamKey>                  │    │
│  │  4. If backend returns 200 OK: Accept stream                         │    │
│  │  5. If backend returns 403: Reject stream                            │    │
│  │  6. Transcode to HLS format (m3u8 + ts segments)                     │    │
│  │  7. Store HLS files in /tmp/hls/                                     │    │
│  │  8. Serve HLS via HTTP on port 8080                                  │    │
│  │  9. On stream end: Call on_publish_done webhook                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      HLS OUTPUT                                       │    │
│  │  • Playlist: /hls/<streamKey>.m3u8                                   │    │
│  │  • Segments: /hls/<streamKey>-*.ts                                   │    │
│  │  • Accessible at: http://localhost:8080/hls/                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP HLS
                                      │ (m3u8 + ts)
                                      ▼
                             [Back to Frontend]
                          HLS Player displays stream


═══════════════════════════════════════════════════════════════════════════════
                        PHASE 2: MULTI-STREAMING (Future)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                   STREAMING SOURCE (OBS Studio)                               │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────┬─┘
                                      │ RTMP
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐ │
│                     NGINX-RTMP SERVER                                     │ │
│  • Receives stream                                                        │ │
│  • Validates with backend                                                 │ │
│  • Transcodes to HLS (for preview)                                        │ │
└───────────────────────────────────────────────────────────────────────┬─┘ │
                                      │                                     │ │
                    ┌─────────────────┼─────────────────┐                   │ │
                    │                 │                 │                   │ │
                    ▼                 ▼                 ▼                   │ │
            ┌───────────┐     ┌───────────┐     ┌───────────┐             │ │
            │  FFMPEG   │     │  FFMPEG   │     │  FFMPEG   │             │ │
            │ Process 1 │     │ Process 2 │     │ Process 3 │             │ │
            └─────┬─────┘     └─────┬─────┘     └─────┬─────┘             │ │
                  │                 │                 │                     │ │
                  │ RTMP            │ RTMP            │ RTMP                │ │
                  │ Relay           │ Relay           │ Relay               │ │
                  ▼                 ▼                 ▼                     │ │
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │ │
        │   YouTube    │  │    Twitch    │  │   Facebook   │              │ │
        │              │  │              │  │              │              │ │
        │ RTMP Server  │  │ RTMP Server  │  │ RTMP Server  │              │ │
        │              │  │              │  │              │              │ │
        │ URL: rtmp:// │  │ URL: rtmp:// │  │ URL: rtmp:// │              │ │
        │ a.rtmp.      │  │ live.twitch  │  │ live-api-s.  │              │ │
        │ youtube.com  │  │ .tv/app      │  │ facebook.com │              │ │
        │              │  │              │  │              │              │ │
        │ Key: User's  │  │ Key: User's  │  │ Key: User's  │              │ │
        │ YT Stream Key│  │ TW Stream Key│  │ FB Stream Key│              │ │
        └──────────────┘  └──────────────┘  └──────────────┘              │ │
                                                                            │ │
                                                                            │ │
        ┌────────────────────────────────────────────────────────────────┐│ │
        │                     BACKEND CONTROLS                            ││ │
        │                                                                 ││ │
        │  • User clicks "Start Stream" for YouTube                      ││ │
        │    → Backend spawns FFmpeg process                             ││ │
        │    → FFmpeg reads from Nginx: rtmp://localhost/live/key        ││ │
        │    → FFmpeg pushes to YouTube: rtmp://a.rtmp.youtube.com/...   ││ │
        │                                                                 ││ │
        │  • User clicks "Start Stream" for Twitch                       ││ │
        │    → Backend spawns another FFmpeg                             ││ │
        │    → Now streaming to BOTH YouTube and Twitch!                 ││ │
        │                                                                 ││ │
        │  • User clicks "Stop Stream" for YouTube                       ││ │
        │    → Backend kills YouTube FFmpeg process                      ││ │
        │    → Twitch continues streaming                                ││ │
        └────────────────────────────────────────────────────────────────┘│ │
                                                                            │ │
═══════════════════════════════════════════════════════════════════════════│═│


## 📊 Data Flow Sequences

### 1. User Registration Flow

```
User (Browser)
    │
    │ 1. Enter email & password
    │
    ▼
Frontend (Next.js)
    │
    │ 2. POST /api/auth/signup
    │    { email, password }
    │
    ▼
Backend API
    │
    │ 3. Hash password (bcrypt)
    │ 4. Check if user exists
    │
    ▼
PostgreSQL
    │
    │ 5. INSERT INTO users
    │
    ◄─┘
    │
    │ 6. Generate JWT token
    │
    ▼
Frontend
    │
    │ 7. Store token in localStorage
    │ 8. Redirect to dashboard
    │
    ▼
User sees Dashboard
```

### 2. Create Project Flow

```
User (Dashboard)
    │
    │ 1. Click "New Project"
    │ 2. Enter project name
    │
    ▼
Frontend
    │
    │ 3. POST /api/projects
    │    Headers: Authorization: Bearer <token>
    │    Body: { name: "My Stream" }
    │
    ▼
Backend API
    │
    │ 4. Verify JWT token
    │ 5. Generate UUID stream key
    │
    ▼
PostgreSQL
    │
    │ 6. INSERT INTO projects
    │    (name, streamKey, userId)
    │
    ◄─┘
    │
    │ 7. Return project with streamKey
    │
    ▼
Frontend
    │
    │ 8. Display stream key
    │ 9. Show RTMP URL
    │
    ▼
User copies stream key
```

### 3. Streaming Flow (OBS → Preview)

```
OBS Studio
    │
    │ 1. User clicks "Start Streaming"
    │    Server: rtmp://localhost/live
    │    Key: abc-123-xyz
    │
    ▼ RTMP Protocol (Port 1935)
Nginx-RTMP
    │
    │ 2. Extract stream key from URL
    │
    ▼ HTTP Webhook
    │ POST /api/streams/on_publish?name=abc-123-xyz
    │
Backend API
    │
    │ 3. Query database
    │
    ▼
PostgreSQL
    │
    │ 4. SELECT * FROM projects
    │    WHERE streamKey = 'abc-123-xyz'
    │
    ◄─┘
    │
    │ 5. If found: Return 200 OK
    │    If not found: Return 403 Forbidden
    │
    ▼
Nginx-RTMP
    │
    │ 6a. If 200: Accept stream
    │ 7a. Transcode to HLS
    │ 8a. Generate .m3u8 playlist
    │ 9a. Generate .ts segments
    │ 10a. Store in /tmp/hls/
    │
    │ 6b. If 403: Reject stream
    │     OBS shows error
    │
    ▼ HTTP (Port 8080)
    │ GET /hls/abc-123-xyz.m3u8
    │
Frontend (HLS Player)
    │
    │ 11. Fetch playlist every few seconds
    │ 12. Download .ts segments
    │ 13. Play video in browser
    │
    ▼
User sees live preview
```

### 4. Add Destination Flow

```
User (Project Page)
    │
    │ 1. Click "Add Destination"
    │ 2. Select platform: YouTube
    │ 3. Enter name, RTMP URL, Stream Key
    │
    ▼
Frontend
    │
    │ 4. POST /api/projects/:id/destinations
    │    Headers: Authorization: Bearer <token>
    │    Body: {
    │      platform: "youtube",
    │      name: "My YouTube Channel",
    │      rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
    │      streamKey: "xxxx-yyyy-zzzz"
    │    }
    │
    ▼
Backend API
    │
    │ 5. Verify JWT & ownership
    │
    ▼
PostgreSQL
    │
    │ 6. INSERT INTO destinations
    │    (projectId, platform, name, rtmpUrl, streamKey)
    │
    ◄─┘
    │
    │ 7. Return destination
    │
    ▼
Frontend
    │
    │ 8. Display destination card
    │ 9. Show "Start Stream" button
    │
    ▼
User can start streaming to YouTube
```

### 5. Multi-Streaming Flow (Phase 2)

```
User (Project Page - While streaming)
    │
    │ 1. Click "Start Stream" for YouTube
    │
    ▼
Frontend
    │
    │ 2. POST /api/destinations/:id/relay/start
    │    Headers: Authorization: Bearer <token>
    │
    ▼
Backend API
    │
    │ 3. Verify stream is active
    │ 4. Get destination details
    │
    ▼
PostgreSQL
    │
    │ 5. SELECT * FROM destinations
    │    WHERE id = :id
    │
    ◄─┘
    │
    │ 6. Spawn FFmpeg process:
    │    ffmpeg -i rtmp://localhost/live/abc-123-xyz
    │           -c:v copy -c:a copy -f flv
    │           rtmp://a.rtmp.youtube.com/live2/yt-key
    │
    ▼
FFmpeg Process
    │
    │ 7. Read stream from Nginx
    │
    ◄─── Nginx-RTMP
    │
    │ 8. Push to YouTube RTMP server
    │
    ▼ RTMP Protocol
YouTube RTMP Ingest
    │
    │ 9. Stream now live on YouTube!
    │
    ▼
YouTube viewers can watch


User clicks "Start Stream" for Twitch
    │
    ▼
Backend spawns another FFmpeg
    │
    ▼
Now streaming to BOTH YouTube & Twitch simultaneously!


User clicks "Stop Stream" for YouTube
    │
    ▼
Backend kills YouTube FFmpeg process
    │
    ▼
Twitch continues streaming
```

## 🔗 Component Communication Summary

| From | To | Protocol | Purpose |
|------|----|----|---------|
| **User Browser** | **Frontend** | HTTPS | Access web UI |
| **Frontend** | **Backend** | HTTP/JSON | API requests |
| **Backend** | **Database** | PostgreSQL | Store/retrieve data |
| **OBS** | **Nginx-RTMP** | RTMP | Send video stream |
| **Nginx-RTMP** | **Backend** | HTTP | Validate stream key |
| **Nginx-RTMP** | **Frontend** | HTTP/HLS | Serve video preview |
| **Backend** | **FFmpeg** | Process spawn | Control multi-streaming |
| **FFmpeg** | **Nginx-RTMP** | RTMP | Read stream |
| **FFmpeg** | **YouTube** | RTMP | Push stream |
| **FFmpeg** | **Twitch** | RTMP | Push stream |
| **FFmpeg** | **Facebook** | RTMP | Push stream |

## 🌐 External Platform Integration

### YouTube
```
Destination URL: rtmp://a.rtmp.youtube.com/live2
User provides: Stream Key from YouTube Studio
FFmpeg relays: Video + Audio to YouTube
YouTube handles: Transcoding, CDN distribution, viewer delivery
```

### Twitch
```
Destination URL: rtmp://live.twitch.tv/app
User provides: Stream Key from Twitch Dashboard
FFmpeg relays: Video + Audio to Twitch
Twitch handles: Transcoding, CDN distribution, viewer delivery
```

### Facebook
```
Destination URL: rtmp://live-api-s.facebook.com:80/rtmp/
User provides: Stream Key from Facebook Live Producer
FFmpeg relays: Video + Audio to Facebook
Facebook handles: Transcoding, CDN distribution, viewer delivery
```

### Custom RTMP
```
Destination URL: User's custom RTMP server
User provides: Custom RTMP URL + Stream Key
FFmpeg relays: Video + Audio to custom server
Custom server handles: Whatever user configured
```

## 📊 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14, React, TailwindCSS | Web UI |
| **Backend** | Node.js, Express, TypeScript | API Server |
| **Database** | PostgreSQL 15 | Data persistence |
| **ORM** | Prisma | Type-safe DB access |
| **Auth** | JWT + bcrypt | User authentication |
| **RTMP Server** | Nginx-RTMP | Stream ingestion |
| **Video Format** | HLS (m3u8 + ts) | Browser-compatible streaming |
| **Multi-Streaming** | FFmpeg | Relay to destinations |
| **Container** | Docker | Isolated services |

---

**This architecture allows:**
- ✅ Users to stream from one source (OBS)
- ✅ Preview their stream in browser
- ✅ Manage multiple destinations
- ✅ Control which platforms receive the stream
- ✅ Stream to 5+ platforms simultaneously
- ✅ Low resource usage (copy codec, no re-encoding)

