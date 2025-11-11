# GoStream - Multi-Platform Live Streaming

[![Build and Push Docker Images](https://github.com/shuhaib-s/Gostream/actions/workflows/docker-build-push.yml/badge.svg)](https://github.com/shuhaib-s/Gostream/actions/workflows/docker-build-push.yml)

**Stream to unlimited destinations simultaneously** - YouTube, Twitch, Facebook, TikTok, Instagram & more. Multi-destination live streaming platform for creators, agencies, and broadcasters.

## ✨ Features

- **🔄 Multi-Platform Broadcasting** - Stream to 10+ platforms simultaneously
- **🎯 Unlimited Destinations** - YouTube, Twitch, Facebook, TikTok, Instagram, LinkedIn & more
- **⚡ Individual Controls** - Start/stop streams per destination
- **📺 Live Preview** - Real-time HLS streaming preview
- **🔒 Enterprise Security** - JWT auth, rate limiting, input validation
- **🐳 Docker Ready** - One-command deployment

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/shuhaib-s/Gostream.git
cd gostream

# Start services
docker-compose -f infra/docker-compose.yml up -d

# Setup backend
cd backend && npm install && npx prisma migrate deploy && npm run dev

# Setup frontend
cd ../frontend && npm install && npm run dev
```

Visit `http://localhost:3000` to start streaming!

> 📖 **Detailed Setup Guide**: See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for complete instructions

## 🎬 How to Use

1. **Create Account** → Sign up at `http://localhost:3000`
2. **Create Project** → Get your unique stream key
3. **Configure OBS** → Server: `rtmp://localhost/live`, Key: `[your-stream-key]`
4. **Add Destinations** → Connect YouTube, Twitch, Facebook, TikTok accounts
5. **Start Streaming** → Use "Start All" or individual controls per platform

**Supported Platforms**: YouTube, Twitch, Facebook, LinkedIn, TikTok, Instagram, Kick, Rumble, Trovo, Custom RTMP

## 🛠️ Tech Stack

**Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL  
**Frontend**: Next.js 14, React, TailwindCSS  
**Streaming**: Nginx-RTMP, FFmpeg, HLS  
**Auth**: JWT, bcrypt, Google OAuth  
**Deployment**: Docker, Docker Compose

## 📊 Architecture

```
gostream/
├── backend/          # API server + stream management
├── frontend/         # React web app
└── infra/            # Docker configs + RTMP server
```

## 🔌 API Reference

**Auth**: `POST /api/auth/signup`, `POST /api/auth/login`  
**Projects**: `GET/POST /api/projects`, `GET/DELETE /api/projects/:id`  
**Destinations**: `POST /api/projects/:id/destinations`, `PUT/DELETE /api/destinations/:id`  
**Streaming**: `POST /api/destinations/:id/relay/start|stop`, `GET /api/relays`

## 🎯 Roadmap

- ✅ **Multi-destination streaming** to 10+ platforms
- ✅ **Individual stream controls** per destination
- ✅ **Real-time preview** with HLS player
- 🚧 **Analytics & recording** (coming soon)
- 🚧 **Team collaboration** (coming soon)

## 🐛 Troubleshooting

**Can't connect?** Check stream key and RTMP URLs  
**Preview not loading?** Wait 10-15 seconds for HLS processing  
**High CPU usage?** Each stream uses ~50MB RAM

> 📖 **Full docs**: [LOCAL_SETUP.md](./LOCAL_SETUP.md) | [Scalability Roadmap](./SCALABILITY_ROADMAP.md)

## 🤝 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/shuhaib-s">
        <img src="https://github.com/shuhaib-s.png" width="100px;" alt="shuhaib-s"/>
        <br />
        <sub><b>Shuhaib</b></sub>
      </a>
      <br />
      <sub>Creator & Lead Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/">
        <img src="https://github.com/octocat.png" width="100px;" alt=""/>
        <br />
        <sub><b>You?</b></sub>
      </a>
      <br />
      <sub>Future Contributor</sub>
    </td>
  </tr>
</table>

<div align="center">

💝 **Contributions Welcome!** 

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or platform support - all help is appreciated.

[📖 Contributing Guide](./CONTRIBUTING.md) | [🐛 Report Issues](https://github.com/shuhaib-s/Gostream/issues) | [💬 Join Discussion](https://github.com/shuhaib-s/Gostream/discussions)

</div>

## 📄 License

MIT - Built with ❤️ for streamers

---

**Keywords**: live streaming, multi-streaming, OBS, YouTube, Twitch, Facebook, RTMP, HLS, broadcasting, content creation
