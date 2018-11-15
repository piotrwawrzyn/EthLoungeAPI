const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const setUpReturnTo = require('./middleware/setUpReturnTo');
const randomstring = require('randomstring');
const SendVerificationEmail = require('../utils/Emails/SendVerificationEmail');
const keys = require('../config/keys');

module.exports = server => {
  server.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.send({ badUsernameOrPassword: true });
        return;
      }

      if (!user.verified)
        return res.send({
          emailUnverified: true
        });

      req.login(user, err => {
        if (err) console.log(err);

        return res.send({ success: true });
      });
    })(req, res, next);
  });

  server.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    User.findOne({ $or: [{ email }, { username }] }, async (err, user) => {
      if (err) return res(err);
      if (!user || user.email === email) {
        // || user.email === email is only for testing
        const new_user = await new User({
          username
        });

        // Apply testing balances
        new_user.balances = [
          { id: 0, balance: '2000000000' },
          { id: 1, balance: '300000000' },
          { id: 2, balance: '1000000000000000000' },
          { id: 3, balance: '10000000000000000000' }
        ];

        new_user.password = await new_user.generateHash(password);
        new_user.email = email;
        new_user.permalink = username
          .toLowerCase()
          .replace(' ', '')
          .replace(/[^\w\s]/gi, '')
          .trim();

        const verificationToken = randomstring.generate(64);

        new_user.verificationToken = verificationToken;

        SendVerificationEmail(new_user);

        await new_user.save();

        res.send();
      } else {
        const errors = [];
        if (user.username === username)
          errors.push(`User ${username} is already registered.`);

        if (user.email === email)
          errors.push(`E-mail address ${email} is already registered.`);

        res.send({ errors: errors });
      }
    });
  });

  server.get('/verify/:permalink/:token', (req, res) => {
    const permalink = req.params.permalink;
    const token = req.params.token;

    User.findOne({ permalink }, (err, user) => {
      if (user.verificationToken === token) {
        if (!user.verified) {
          user.verified = true;
          user.save();

          req.login(user, err => {
            if (err) console.log(err);
            return res.redirect(keys.frontEndServer);
          });
        } else {
          res.send('This link is no longer valid.');
        }
      } else {
        res.send('This link is invalid.');
      }
    });
  });

  server.get('/logout', (req, res) => {
    req.logout();
    res.send(req.user);
  });

  server.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};
