import LocalStrategy from 'passport-local';
import * as usersDao from './dao/usersDao.mjs';
import { verifyPassword } from './utils/password.mjs';

/**
 * Configure Passport.js with the local authentication strategy
 * and user session serialization/deserialization.
 *
 * @param {Object} passport - The Passport instance to configure
 */
function configurePassport(passport) {
  // Configure local strategy for username/password authentication
  passport.use(new LocalStrategy(
    { usernameField: 'name' }, // Use 'name' field instead of default 'username'
    async (username, password, done) => {
      try {
        // Attempt to find user by username
        const user = await usersDao.getUserByName(username);

        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        // Verify password using scrypt
        const match = await verifyPassword(password, user.passwordHash);
        if (!match) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  /**
   * Serialize user for session storage.
   * Store complete user data (except password) in session for efficiency.
   */
  passport.serializeUser((user, done) => {
    done(null, { 
      id: user.id, 
      name: user.name, 
      role: user.role 
    });
  });

  /**
   * Deserialize user from session.
   * Return user data directly from session without database call.
   */
  passport.deserializeUser(async (userData, done) => {
    try {
      // Return user data directly from session - no DB call needed
      done(null, userData);
    } catch (err) {
      done(err, null);
    }
  });
}

export default configurePassport;
