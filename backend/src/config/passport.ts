import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import config from './index';
import { userRepository } from '../repositories';
import logger from '../utils/logger';

/**
 * Configure Passport with Google OAuth 2.0 Strategy
 */
export const configurePassport = () => {
  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await userRepository.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  if (config.google.clientId && config.google.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.google.clientId,
          clientSecret: config.google.clientSecret,
          callbackURL: config.google.callbackURL,
          scope: ['profile', 'email'],
        },
        async (
          accessToken: string,
          refreshToken: string,
          profile: Profile,
          done: VerifyCallback
        ) => {
          try {
            logger.info('Google OAuth callback received', { googleId: profile.id });

            // Extract user info from Google profile
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName || profile.name?.givenName || 'Google User';
            const googleId = profile.id;

            if (!email) {
              return done(new Error('No email found in Google profile'), undefined);
            }

            // Check if user already exists by email or googleId
            let user = await userRepository.findByEmail(email);

            if (!user) {
              // Check by Google ID
              user = await userRepository.findByGoogleId(googleId);
            }

            if (user) {
              // User exists - update Google ID if not set
              if (!user.googleId && googleId) {
                user = await userRepository.update(user.id, { googleId });
                logger.info('Updated existing user with Google ID', { userId: user.id });
              }
              return done(null, user);
            }

            // Create new user
            const newUser = await userRepository.create({
              email,
              name,
              googleId,
              passwordHash: undefined, // No password for OAuth users
            });

            logger.info('New user created via Google OAuth', { userId: newUser.id, email });
            return done(null, newUser);
          } catch (error: any) {
            logger.error('Google OAuth error', { error: error.message });
            return done(error, undefined);
          }
        }
      )
    );
    logger.info('Google OAuth strategy configured');
  } else {
    logger.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }
};

export default passport;

