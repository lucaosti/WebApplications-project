import express from 'express';
import passport from 'passport';

const router = express.Router();

/**
 * POST /api/login
 * Authenticate user using Passport local strategy.
 * Returns user information on successful authentication.
 */
router.post('/login', (req, res, next) => {
  const { name } = req.body;
  console.log(`[AUTH] Login attempt for user: ${name}`);
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('[AUTH] Authentication error:', err.message);
      return next(err);
    }

    if (!user) {
      console.log(`[AUTH] Login failed for user ${name}: ${info?.message || 'Unknown error'}`);
      return res.status(401).json({ error: info?.message || 'Login failed' });
    }

    // Create user session
    req.login(user, (err) => {
      if (err) {
        console.error('[AUTH] Session creation error:', err.message);
        return next(err);
      }

      console.log(`[AUTH] Login successful: user ${user.name} (${user.role})`);
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
 * Log out the current authenticated user and destroy session.
 */
router.post('/logout', (req, res) => {
  const username = req.user?.name || 'Unknown';
  console.log(`[AUTH] Logout request from user: ${username}`);
  
  req.logout((err) => {
    if (err) {
      console.error('[AUTH] Logout error:', err.message);
      return res.status(500).json({ error: 'Logout failed' });
    }
    console.log(`[AUTH] Logout successful: user ${username}`);
    res.status(204).end();  // No content response - frontend handles success message
  });
});

export default router;
