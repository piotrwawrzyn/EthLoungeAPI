const keys = require('./config/keys');
const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const cors = require('cors');
const fileUpload = require('express-fileupload');

var path = require('path');
global.root = path.resolve(__dirname);

require('./models/Admin');
require('./models/Gambler');
require('./services/passport');

const bodyParser = require('body-parser');
const autoIncrement = require('mongoose-auto-increment');

const server = express();

server.use(cors());
server.use(fileUpload());

server.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);

server.use(passport.initialize());
server.use(passport.session());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(express.static('public'));

mongoose.connect(keys.mongoDbURI);
autoIncrement.initialize(mongoose.connection);

require('./models/Team');
require('./models/Match');
require('./routes/auth-routes-gambler')(server);
require('./routes/auth-routes-admin')(server);
require('./routes/backend-routes')(server);

const port = process.env.PORT || 5000;

server.listen(port, err => {
  if (err) throw err;
});
