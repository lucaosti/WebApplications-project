import express from 'express';
import passport from 'passport';

const router = express.Router();

/**
 * POST /api/login
 * Authenticate user using Passport local strategy.
 * On success, returns user info.
 */
router.post('/login', (req, res, next) => {
  console.log('POST /login called');
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Auth error:', err);
      return next(err);
    }

    if (!user) {
      console.log('Login failed:', info);
      return res.status(401).json({ error: info?.message || 'Login failed' });
    }

    req.login(user, (err) => {
      if (err) {
        console.error('Login session error:', err);
        return next(err);
      }

      console.log('Login success:', user);
      return res.json({
        id: user.id,
        name: user.name,
        role: user.role
      });
    });
  })(req, res, next);
});

/**
 * POST /api/logout
 * Log out the current authenticated user.
 */
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    console.log('Logout success');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

export default router;
