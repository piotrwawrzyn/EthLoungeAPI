const mongoose = require('mongoose');
const Match = mongoose.model('match');
const Team = mongoose.model('team');
const League = mongoose.model('league');
const fillInfo = require('../../utils/fillInfo');
const { MATCHES_PER_PAGE } = require('../../config/constants');
const sortMatches = require('../../helpers/match/sortMatches');

module.exports = server => {
  server.get('/api/index_info', async (req, res) => {
    const page = isNaN(req.query.page) ? 1 : req.query.page;

    let matches = await Match.find({})
      .sort({ startTime: -1 })
      .limit(page * 50)
      .lean()
      .exec();

    // Validate if page "exists"
    if (matches.length < (page - 1) * MATCHES_PER_PAGE + 1) {
      res.send({ matches: [] });
      return;
    }

    matches = sortMatches(matches, page);

    // SORT FOR: CLOSEST, UPCOMING, PAST

    const teams = await Team.find({})
      .lean()
      .exec();
    const leagues = await League.find({})
      .lean()
      .exec();

    for (match of matches) {
      match.teams = fillInfo(match.teams, teams);
      match.league = fillInfo(match.league, leagues);
    }

    const indexProps = { matches };

    res.send(indexProps);
  });
};
