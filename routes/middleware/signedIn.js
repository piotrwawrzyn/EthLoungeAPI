const signedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/404');
  }
};

module.exports = signedIn;
