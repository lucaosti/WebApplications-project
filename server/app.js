const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);

const configurePassport = require('./passport-config');
const authRouter = require('./routes/auth');
const assignmentsRouter = require('./routes/assignments');

const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Configure session storage using SQLite
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: path.join(__dirname, './db')
  }),
  secret: 'session-secret', // Key for signing the session ID cookie
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 86400000   // 1 day
  }
}));

// Initialize Passport and session management
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

// Routes
app.use('/api', authRouter);
app.use('/api', assignmentsRouter);

// Logged-in user info (for frontend session state)
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = app;
