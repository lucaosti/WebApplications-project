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
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Login failed' });
    }

    // Create user session
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

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
 * Terminates the user session and clears authentication state.
 */
router.post('/logout', (req, res) => {
  const username = req.user?.name || 'Unknown';
  
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.status(204).end();  // No content response - frontend handles success message
  });
});

export default router;
