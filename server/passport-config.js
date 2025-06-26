const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const usersDao = require('./dao/usersDao');

/**
 * Configures Passport.js with local strategy for login and session management.
 * 
 * @param {Object} passport - The Passport instance from Express
 */
function configurePassport(passport) {
  // Define the local strategy used during login
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      // Look up user by username
      const user = await usersDao.getUserByName(username);
      if (!user)
        return done(null, false, { message: 'Incorrect username.' });

      // Compare provided password with stored hash
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match)
        return done(null, false, { message: 'Incorrect password.' });

      // If credentials match, return the user object
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Serialize user into the session (stores only the user ID)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session (retrieves full user object by ID)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await usersDao.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

module.exports = configurePassport;
