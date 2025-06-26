const express = require('express');
const passport = require('passport');

const router = express.Router();

// POST /api/login
// Logs in the user using Passport local strategy
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(user);
    });
  })(req, res, next);
});

// POST /api/logout
// Logs out the current user and destroys the session
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy(() => {
      res.status(204).end();
    });
  });
});

module.exports = router;