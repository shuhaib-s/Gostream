import dotenv from 'dotenv';

dotenv.config();

interface Config {
  env: string;
  port: number;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    cookieName: string;
  };
  bcrypt: {
    saltRounds: number;
  };
  cors: {
    origin: string;
  };
  cookie: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
  rtmp: {
    serverUrl: string;
    port: number;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackURL: string;
  };
}

/**
 * Constructs PostgreSQL database URL from individual components or uses DATABASE_URL
 * Priority: DATABASE_URL > Individual components
 */
const getDatabaseUrl = (): string => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const {
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_USER = 'postgres',
    DB_PASSWORD = '',
    DB_NAME = 'gostream',
  } = process.env;

  if (!DB_PASSWORD) {
    throw new Error('Database password is required (DB_PASSWORD or DATABASE_URL)');
  }

  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public`;
};

/**
 * Validates and returns JWT secret
 * In production, this must be a strong, random string
 */
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production environment');
    }
    console.warn('⚠️  WARNING: Using default JWT_SECRET. This is INSECURE for production!');
    return 'default-dev-secret-change-in-production';
  }

  if (secret.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters for security');
  }

  return secret;
};

/**
 * Application Configuration
 * All environment variables and constants are centralized here
 */
const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  
  database: {
    url: getDatabaseUrl(),
  },
  
  jwt: {
    secret: getJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: process.env.JWT_COOKIE_NAME || 'auth_token',
  },
  
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  
  cookie: {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
    sameSite: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
  
  rtmp: {
    serverUrl: process.env.RTMP_SERVER_URL || 'rtmp://localhost/live',
    port: parseInt(process.env.RTMP_PORT || '1935', 10),
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
  },
};


export default config;

