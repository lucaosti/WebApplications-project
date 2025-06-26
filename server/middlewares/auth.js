/**
 * Middleware to ensure user is logged in.
 */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
}

/**
 * Middleware to ensure user is a teacher.
 */
function isTeacher(req, res, next) {
  if (req.user?.role === 'teacher') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: teachers only' });
}

/**
 * Middleware to ensure user is a student.
 */
function isStudent(req, res, next) {
  if (req.user?.role === 'student') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: students only' });
}

module.exports = {
  isLoggedIn,
  isTeacher,
  isStudent
};
