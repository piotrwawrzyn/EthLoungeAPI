const setUpReturnTo = (req, res, next) => {
  req.session.returnTo = req.headers.referer;
  next();
};

module.exports = setUpReturnTo;
