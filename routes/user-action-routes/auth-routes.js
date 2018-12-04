const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Token = mongoose.model('token');
const randomstring = require('randomstring');
const sendEmail = require('../../services/nodemailer/sendEmail');
const keys = require('../../config/keys');
const verificationEmailTemplate = require('../../services/nodemailer/templates/verificationEmail');
const _ = require('lodash');

module.exports = server => {
  server.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.send({ invalidCredentials: true });
        return;
      }

      if (!user.verified)
        return res.send({
          unverifiedEmail: true
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
        const tokens = await Token.find({})
          .lean()
          .exec();
        const OMG_ID = _.find(tokens, { symbol: 'OMG' })._id;
        const POWR_ID = _.find(tokens, { symbol: 'POWR' })._id;
        const MTL_ID = _.find(tokens, { symbol: 'MTL' })._id;
        const ETH_ID = _.find(tokens, { symbol: 'ETH' })._id;
        const BAT_ID = _.find(tokens, { symbol: 'BAT' })._id;

        new_user.balances = [
          { id: OMG_ID, balance: '250000000000000000000' },
          { id: POWR_ID, balance: '500000000' },
          { id: MTL_ID, balance: '50000000000' },
          { id: ETH_ID, balance: '1500000000000000000' },
          { id: BAT_ID, balance: '1000000000000000000000' }
        ];

        new_user.password = await new_user.generateHash(password);
        new_user.email = email;

        const permalink = username
          .toLowerCase()
          .replace(' ', '')
          .replace(/[^\w\s]/gi, '')
          .trim();

        const verificationToken = randomstring.generate(64);

        new_user.permalink = permalink;
        new_user.verificationToken = verificationToken;

        sendEmail(
          new_user.email,
          'Verify your email to join ethlounge',
          verificationEmailTemplate(
            new_user.permalink,
            verificationToken,
            username
          )
        );

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

  server.post('/resend-verification-email', (req, res) => {
    const { username } = req.body;
    User.findOne({ username: username }, (err, user) => {
      if (!user) return;

      if (user.verified) return;

      console.log(user);
      sendEmail(
        user.email,
        'Verify your email to join ethlounge',
        verificationEmailTemplate(
          user.permalink,
          user.verificationToken,
          username
        )
      );
    });

    res.send();
  });

  server.get('/logout', (req, res) => {
    req.logout();
    res.send(req.user);
  });

  server.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};
