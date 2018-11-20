const mongoose = require('mongoose');
const Match = mongoose.model('match');
const Team = mongoose.model('team');
const League = mongoose.model('league');
const fillInfo = require('../../utils/fillInfo');

module.exports = server => {
  server.get('/api/index_info', async (req, res) => {
    let matches = await Match.find({})
      .sort({ startTime: -1 })
      .limit(20)
      .lean()
      .exec();
    console.log(matches);

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
