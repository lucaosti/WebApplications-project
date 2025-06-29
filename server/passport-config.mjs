import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
import * as usersDao from './dao/usersDao.mjs';

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
          console.log(`[AUTH] Login failed: unknown username "${username}"`);
          return done(null, false, { message: 'Invalid credentials' });
        }

        // Verify password using bcrypt
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
          console.log(`[AUTH] Login failed: invalid password for user "${username}"`);
          return done(null, false, { message: 'Invalid credentials' });
        }

        console.log(`[AUTH] Login successful: user ${username} (${user.role})`);
        return done(null, user);
      } catch (err) {
        console.error('[AUTH] Error during authentication:', err.message);
        return done(err);
      }
    }
  ));

  /**
   * Serialize user for session storage.
   * Only store user ID in session for security and efficiency.
   */
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  /**
   * Deserialize user from session.
   * Retrieve full user object from database using stored ID.
   */
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await usersDao.getUserById(id);
      done(null, user);
    } catch (err) {
      console.error('[AUTH] Error deserializing user:', err.message);
      done(err, null);
    }
  });
}

export default configurePassport;
