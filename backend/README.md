# StreamBridge Backend

## 🎯 Overview

Production-ready Node.js/Express backend for StreamBridge, designed to handle **1000+ concurrent users** with enterprise-grade architecture, security, and scalability.

## ✨ Features

- **🏗️ Layered Architecture**: Controllers → Repositories → Database
- **🔒 Secure Authentication**: JWT with bcrypt password hashing
- **📊 Structured Logging**: Timestamps, log levels, and performance tracking
- **🛡️ Error Handling**: Custom error classes with proper HTTP status codes
- **💾 Repository Pattern**: Clean data access layer with type safety
- **⚡ Optimized Database**: Singleton Prisma client with connection pooling
- **🔄 Graceful Shutdown**: Proper cleanup on process termination
- **📝 Input Validation**: Email, UUID, RTMP URL validation
- **🎬 Stream Management**: RTMP stream authentication and tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Docker (optional, for local development)

### Installation

1. **Clone and navigate to backend**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

4. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

5. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```

6. **Start the server**:
   ```bash
   # Development (with hot reload)
   npm run dev

   # Production
   npm run build
   npm start
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration and database setup
│   ├── controllers/     # Business logic and request handlers
│   ├── middlewares/     # Auth, logging, error handling
│   ├── repositories/    # Database operations (data access layer)
│   ├── routes/          # API endpoint definitions
│   ├── utils/           # Utilities (logger, JWT, validation, errors)
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server startup and lifecycle
├── prisma/
│   └── schema.prisma    # Database schema
├── ARCHITECTURE.md      # Detailed architecture documentation
└── package.json
```

## 🔧 Configuration

All configuration is managed through environment variables. See `env.example` for all available options.

### Required Variables

```bash
# Database (Option 1: Full URL)
DATABASE_URL=postgresql://user:password@host:port/database

# Database (Option 2: Individual components)
DB_HOST=localhost
DB_PORT=5432
DB_USER=streambridge
DB_PASSWORD=your_password
DB_NAME=streambridge

# JWT Secret (MUST be changed in production!)
JWT_SECRET=your_secure_random_string_32_chars_or_more

# Server
PORT=4000
NODE_ENV=development
```

### Optional Variables

```bash
JWT_EXPIRES_IN=7d              # Token expiration (e.g., 60s, 10m, 2h, 7d)
BCRYPT_SALT_ROUNDS=10          # Bcrypt rounds (10-12 for production)
CORS_ORIGIN=*                  # CORS allowed origins
```

## 📚 API Endpoints

### Authentication

- **POST** `/api/auth/signup` - Create new user account
- **POST** `/api/auth/login` - Login and get JWT token

### Projects (Authenticated)

- **GET** `/api/projects` - List all user's projects
- **POST** `/api/projects` - Create new project
- **GET** `/api/projects/:id` - Get project details
- **DELETE** `/api/projects/:id` - Delete project

### Destinations (Authenticated)

- **POST** `/api/projects/:projectId/destinations` - Add streaming destination
- **PUT** `/api/destinations/:id` - Update destination
- **DELETE** `/api/destinations/:id` - Delete destination

### Streams (RTMP Callbacks)

- **POST** `/api/streams/on_publish` - Stream started (called by Nginx)
- **POST** `/api/streams/on_publish_done` - Stream ended (called by Nginx)

### Health Check

- **GET** `/health` - Server health and status

## 🏗️ Architecture Highlights

### 1. Repository Pattern

All database operations are abstracted through repositories:

```typescript
// Instead of direct Prisma calls in controllers
const user = await prisma.user.findByEmail(email); // ❌ Old way

// Use repositories
import { userRepository } from '../repositories';
const user = await userRepository.findByEmail(email); // ✅ New way
```

**Benefits**:
- Centralized error handling
- Consistent logging
- Easy to test (mock repositories)
- Can add caching layer easily

### 2. Structured Logging

```typescript
import logger from '../utils/logger';

logger.info('User created', { userId, email });
logger.error('Database error', error);
logger.http('GET', '/api/users', 200, 45); // 45ms response time
```

**Output**:
```
[2025-11-09T10:30:45.123Z] [INFO] [StreamBridge] User created {"userId":"123","email":"user@example.com"}
```

### 3. Custom Error Classes

```typescript
import { ValidationError, NotFoundError, AuthenticationError } from '../utils/errors';

// Throw typed errors with proper status codes
throw new ValidationError('Email is required'); // 400
throw new NotFoundError('User'); // 404
throw new AuthenticationError('Invalid credentials'); // 401
```

### 4. Singleton Prisma Client

```typescript
// Single database connection pool shared across the application
import prisma from '../config/database';

// Instead of:
const prisma = new PrismaClient(); // ❌ Multiple instances = connection exhaustion
```

## 🔒 Security Features

✅ **JWT Authentication** with configurable expiration  
✅ **Password Hashing** with bcrypt (10 rounds default)  
✅ **Input Validation** (email, UUID, URL formats)  
✅ **SQL Injection Prevention** (Prisma ORM)  
✅ **XSS Prevention** (input sanitization)  
✅ **Error Security** (no sensitive data in errors)  
✅ **CORS Configuration**  
✅ **Request Size Limits** (10mb)  

### Recommended Production Additions

- Rate limiting (express-rate-limit)
- Helmet.js for security headers
- HTTPS/TLS encryption
- API key rotation
- WAF (Web Application Firewall)

## 📊 Performance & Scalability

### Current Optimizations

- **Database Connection Pooling**: Automatic via Prisma
- **Singleton Pattern**: Single Prisma instance
- **Efficient Queries**: Optimized with proper indexes
- **Stateless Auth**: JWT (no server-side sessions)
- **Graceful Shutdown**: Proper connection cleanup

### Handling 1000+ Concurrent Users

**Current Setup Supports**:
- Horizontal scaling (multiple server instances)
- Stateless design (load balancer ready)
- Efficient database connection pooling
- Fast authentication (JWT verification)

**When to Scale Further**:
- Add Redis for caching frequently accessed data
- Implement rate limiting per user/IP
- Add read replicas for database
- Use CDN for static assets
- Implement message queues for async tasks

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage

# Run linter
npm run lint
```

## 📈 Monitoring

### Built-in Logging

All requests, database queries, and errors are logged with timestamps:

```
[2025-11-09T10:30:45.123Z] [INFO] [StreamBridge] HTTP GET /api/projects 200 {"duration":"45ms"}
[2025-11-09T10:30:45.200Z] [DEBUG] [StreamBridge] Database FIND_BY_USER_ID on Project
```

### Recommended Production Monitoring

- **Log Aggregation**: ELK Stack, Loki, CloudWatch
- **APM**: DataDog, New Relic, Dynatrace
- **Error Tracking**: Sentry, Rollbar
- **Metrics**: Prometheus + Grafana
- **Uptime Monitoring**: Pingdom, UptimeRobot

## 🐳 Docker Deployment

```dockerfile
# Production Dockerfile included
docker build -t streambridge-backend .
docker run -p 4000:4000 --env-file .env streambridge-backend
```

## 🔄 Database Migrations

```bash
# Create new migration (development)
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## 🚨 Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   docker ps | grep postgres
   ```

2. Test database connection:
   ```bash
   psql postgresql://user:password@localhost:5432/database
   ```

3. Check DATABASE_URL in `.env`

### Migration Issues

```bash
# If tables don't exist
npx prisma migrate deploy

# If schema is out of sync
npx prisma db push
```

### JWT Issues

- Ensure JWT_SECRET is at least 32 characters
- Check token expiration (JWT_EXPIRES_IN)
- Verify Authorization header format: `Bearer <token>`

## 📖 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Detailed architecture documentation
- **[API Documentation](https://documenter.getpostman.com/...)**: Full API reference (TODO)
- **[Prisma Docs](https://www.prisma.io/docs)**: Database ORM documentation

## 🤝 Development Workflow

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Follow Architecture Patterns**:
   - Add database operations in repositories
   - Handle business logic in controllers
   - Use custom error classes
   - Add proper logging
   - Validate all inputs

3. **Test Your Changes**:
   ```bash
   npm run dev
   # Test endpoints with Postman/curl
   ```

4. **Check for Errors**:
   ```bash
   npm run build  # Should compile without errors
   ```

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Async/Await**: Prefer over promises
- **Error Handling**: Always use try-catch or pass to next()
- **Logging**: Use logger, never console.log

## 🔐 Environment Variables Security

**Development**:
- Use `.env` file (never commit to git)
- `.env` is in `.gitignore`

**Production**:
- Use environment variables from hosting platform
- Never hardcode secrets
- Rotate JWT secret regularly
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)

## 📞 Support

For issues or questions:
1. Check [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions
2. Review error logs with timestamps
3. Check database connectivity
4. Verify environment configuration

## 📄 License

MIT License - See LICENSE file for details

---

**Built with** ❤️ **for production-scale streaming**

