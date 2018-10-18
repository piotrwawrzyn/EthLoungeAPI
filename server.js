const keys = require('./config/keys');
const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
require('./models/User');
require('./services/passport');
const bodyParser = require('body-parser');
const flash = require('connect-flash');

const server = express();

server.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);
server.use(flash());
server.use(passport.initialize());
server.use(passport.session());
server.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(keys.mongoDbURI);

require('./routes/auth-routes')(server);

const port = process.env.PORT || 5000;

server.listen(port, err => {
  if (err) throw err;
});
