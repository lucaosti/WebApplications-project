/**
 * Middleware to ensure user is authenticated.
 * Returns 401 if user is not logged in.
 */
export function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
}

/**
 * Middleware to ensure user has teacher role.
 * Returns 403 if user is not a teacher.
 */
export function isTeacher(req, res, next) {
  const role = req.user?.role?.trim().toLowerCase();

  if (role === 'teacher') {
    return next();
  }

  console.log(`[AUTH] Access denied: user ${req.user?.name || 'Unknown'} (${role}) tried to access teacher-only resource`);
  return res.status(403).json({ error: 'Forbidden: teachers only' });
}

/**
 * Middleware to ensure user has student role.
 * Returns 403 if user is not a student.
 */
export function isStudent(req, res, next) {
  const role = req.user?.role?.trim().toLowerCase();

  if (role === 'student') {
    return next();
  }

  console.log(`[AUTH] Access denied: user ${req.user?.name || 'Unknown'} (${role}) tried to access student-only resource`);
  return res.status(403).json({ error: 'Forbidden: students only' });
}
