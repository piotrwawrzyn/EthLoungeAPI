const passport = require('passport');

module.exports = server => {
  server.post(
    '/admin/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/error',
      failureFlash: true,
      passReqToCallback: true
    })
  );

  server.get('/admin/logout', (req, res) => {
    req.logout();
    res.send(req.user);
  });

  server.get('/api/current_admin', (req, res) => {
    res.send(req.user);
  });
};
