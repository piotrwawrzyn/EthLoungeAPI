const keys = require('./config/keys');
const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const autoIncrement = require('mongoose-auto-increment');
const corsOptions = {
  origin: keys.corsAllow,
  optionsSuccessStatus: 200
};
const port = process.env.PORT || 5000;
const path = require('path');
const helmet = require('helmet');
const server = express();

// Setup
autoIncrement.initialize(mongoose.connection);
global.root = path.resolve(__dirname);
require('./services/cloudinary');

// Models
require('./models/User');
require('./models/Team');
require('./models/Token');
require('./models/Match');
require('./models/League');
require('./models/Bet');

// Services
require('./services/passport');

// Middleware
server.use(helmet());
server.use(cors(corsOptions));
server.use(fileUpload());
server.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(express.static('public'));
server.use(passport.initialize());
server.use(passport.session());

// Routes
require('./routes/user-action-routes/auth-routes')(server);
require('./routes/user-action-routes/bet-routes')(server);

require('./routes/model-routes/team-routes')(server);
require('./routes/model-routes/league-routes')(server);
require('./routes/model-routes/match-routes')(server);
require('./routes/model-routes/token-routes')(server);
require('./routes/model-routes/user-routes')(server);

require('./routes/external-api/panda-score-api')(server);

require('./routes/page-routes/match-routes')(server);
require('./routes/page-routes/index-routes')(server);

require('./routes/page-routes/admin/index-routes')(server);
require('./routes/page-routes/admin/users-routes')(server);

mongoose.connect(keys.mongoDbURI);

// Continous actions
require('./continous/updatePrices');
require('./continous/updateScheduledMatches');

server.listen(port, err => {
  if (err) throw err;
});
