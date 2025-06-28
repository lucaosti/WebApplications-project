import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import SQLiteStoreFactory from 'connect-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

import configurePassport from './passport-config.js';
import authRouter from './routes/auth.js';
import assignmentsRouter from './routes/assignments.js';

// Resolve __dirname for ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLiteStore = SQLiteStoreFactory(session);
const app = express();

/**
 * Request logging middleware.
 * Logs only API requests with timestamp to reduce console noise.
 */
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    const timestamp = new Date().toISOString().slice(11, 19); // HH:mm:ss format
    console.log(`[${timestamp}] HTTP ${req.method} ${req.url}`);
  }
  next();
});

// Enable CORS for the frontend on localhost:5173 with credentials
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Configure sessions stored in SQLite DB
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: path.join(__dirname, './db')
  }),
  secret: 'session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,    // Set true if HTTPS
    httpOnly: true,   // Protect from client JS
    maxAge: 86400000  // 1 day in ms
  }
}));

// Initialize Passport and session handling
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

// Register API routes for authentication and assignments
app.use('/api', authRouter);
app.use('/api', assignmentsRouter);

/**
 * API endpoint to check current user session status.
 * Returns user information if authenticated, otherwise returns 401.
 */
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(`[AUTH] Session check: user ${req.user.name} (${req.user.role}) is authenticated`);
    res.json({
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    });
  } else {
    console.log('[AUTH] Session check: user not authenticated');
    res.status(401).json({ error: 'Not authenticated' });
  }
});

/**
 * Handle unmatched API routes.
 * Return 404 error for any API endpoint that doesn't exist.
 */
app.use('/api/*', (_, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Global error handler for unhandled exceptions.
 * Logs error details and returns generic error response to client.
 */
app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled server error:', err.message);
  // Show full stack trace only in development environment
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR] Stack trace:', err.stack);
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
