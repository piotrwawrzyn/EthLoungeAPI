const mongoose = require('mongoose');
const Match = mongoose.model('match');
const Team = mongoose.model('team');
const League = mongoose.model('league');
const fillInfo = require('../../utils/fillInfo');

module.exports = server => {
  server.get('/api/index_info', async (req, res) => {
    let matches = await Match.find({})
      .sort({ startTime: -1 })
      .limit(30)
      .lean()
      .exec();

    // SORT FOR: CLOSEST, UPCOMING, PAST

    const now = new Date();

    let future = matches.filter(match => match.startTime >= now);
    future = future.reverse();
    let past = matches.filter(match => match.startTime < now);
    matches = [...future, ...past];

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
