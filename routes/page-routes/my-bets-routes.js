const mongoose = require('mongoose');
const Match = mongoose.model('match');
const Team = mongoose.model('team');
const League = mongoose.model('league');
const fillInfo = require('../../utils/fillInfo');
const { MATCHES_PER_PAGE } = require('../../config/constants');
const sortMatches = require('../../helpers/match/sortMatches');

module.exports = server => {
  server.get('/api/my_bets', async (req, res) => {});
};
