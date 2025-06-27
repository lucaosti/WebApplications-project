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

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLiteStore = SQLiteStoreFactory(session);
const app = express();

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
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
 * Return the currently authenticated user info.
 */
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

/**
 * Return 404 error for unmatched /api/* routes.
 */
app.use('/api/*', (_, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Generic error handler for internal server errors.
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
