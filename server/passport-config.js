import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
import * as usersDao from './dao/usersDao.js';

/**
 * Configure Passport.js with the local authentication strategy
 * and user session serialization/deserialization.
 *
 * @param {Object} passport - The Passport instance
 */
function configurePassport(passport) {
  // Configure the LocalStrategy (username = name field)
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      // Look up the user by name
      const user = await usersDao.getUserByName(username);
      if (!user)
        return done(null, false, { message: 'Incorrect username.' });

      // Compare password with hashed password
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match)
        return done(null, false, { message: 'Incorrect password.' });

      // Authentication successful
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Serialize user: store user ID in session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user: retrieve full user object from ID
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await usersDao.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

export default configurePassport;
