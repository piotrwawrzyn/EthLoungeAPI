const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const setUpReturnTo = require('./middleware/setUpReturnTo');

module.exports = server => {
  server.post(
    '/login',
    setUpReturnTo,
    passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      failureRedirect: '/error',
      failureFlash: false,
      passReqToCallback: true
    })
  );

  server.post('/register', (req, res) => {
    const { username, password } = req.body;
    console.log(username);
    User.findOne({ username }, async (err, user) => {
      if (err) return res(err);
      if (!user) {
        const new_user = await new User({
          username
        });
        new_user.password = await new_user.generateHash(password);
        new_user.save();
        res.send({ success: true });
      } else {
        res.send({ success: false });
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
