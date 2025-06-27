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
  passport.use(new LocalStrategy(
    { usernameField: 'name' },
    async (username, password, done) => {
      try {
        // Attempt login
        const user = await usersDao.getUserByName(username);

        if (!user) {
          console.log(`Login failed: unknown username "${username}"`);
          return done(null, false, { message: 'Incorrect username.' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
          console.log(`Login failed: password mismatch for user "${username}"`);
          return done(null, false, { message: 'Incorrect password.' });
        }

        console.log(`Login success for user "${username}" (${user.role})`);
        return done(null, user);
      } catch (err) {
        console.error('Error during authentication:', err);
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await usersDao.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

export default configurePassport;
