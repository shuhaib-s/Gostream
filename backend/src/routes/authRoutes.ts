import { Router } from 'express';
import { signup, login, logout, me, googleCallback } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import passport from '../config/passport';

const router = Router();

// Traditional auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login?error=auth_failed',
  }),
  googleCallback
);

export default router;


