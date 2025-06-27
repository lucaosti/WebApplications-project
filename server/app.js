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

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLiteStore = SQLiteStoreFactory(session);
const app = express();

// Enable CORS for development frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Configure session using SQLite storage
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: path.join(__dirname, './db')
  }),
  secret: 'session-secret', // Not for production use
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,      // true = HTTPS only
    httpOnly: true,     // Prevent client-side access
    maxAge: 86400000    // 1 day
  }
}));

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

// Register API routes
app.use('/api', authRouter);
app.use('/api', assignmentsRouter);

// Endpoint to get the current logged-in user
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

export default app;
