/**
 * Middleware to ensure user is authenticated.
 */
export function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ error: 'Not authenticated' });
}

/**
 * Middleware to ensure user has teacher role.
 */
export function isTeacher(req, res, next) {
  const role = req.user?.role?.trim().toLowerCase();

  console.log('[Auth] Role check (teacher):', role);

  if (role === 'teacher') {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden: teachers only' });
}

/**
 * Middleware to ensure user has student role.
 */
export function isStudent(req, res, next) {
  const role = req.user?.role?.trim().toLowerCase();

  console.log('[Auth] Role check (student):', role);

  if (role === 'student') {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden: students only' });
}
