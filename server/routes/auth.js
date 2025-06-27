import express from 'express';
import passport from 'passport';

const router = express.Router();

/**
 * Route for logging in.
 * Uses Passport local strategy.
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Login failed' });
    }

    req.login(user, (err) => {
      if (err) return next(err);

      // Return basic user info
      return res.json({
        id: user.id,
        name: user.name,
        role: user.role
      });
    });
  })(req, res, next);
});

/**
 * Route for logging out the current user.
 */
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

export default router;
