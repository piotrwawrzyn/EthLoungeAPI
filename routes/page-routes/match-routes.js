const mongoose = require('mongoose');
const Token = mongoose.model('token');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');
const Match = mongoose.model('match');
const Team = mongoose.model('team');
const League = mongoose.model('league');
const _ = require('lodash');

module.exports = server => {
  server.get('/api/match_info', async (req, res) => {
    const matchID = req.query.id;

    let match = await Match.findById(matchID, (err, match) => {
      if (err || !match) {
        res.send(null);
        return;
      }

      return match;
    })
      .lean()
      .exec();
    match.numberOfBets = match.bets.length;

    let teams = await Team.find({
      _id: { $in: [match.teams[0].id, match.teams[1].id] }
    })
      .lean()
      .exec();

    let league = await League.findById(match.league)
      .lean()
      .exec();

    const tokens = await Token.find({});

    const bets = await Bet.find({ _id: { $in: match.bet } }).exec();

    let bet = false;
    if (req.user) {
      const user = await User.findById({ _id: req.user.id });

      const all_bets_by_user = await Bet.find({ _id: { $in: user.bets } });

      for (let i = 0; i < all_bets_by_user.length; i++) {
        if (all_bets_by_user[i].matchID === matchID) {
          bet = curr;
          break;
        }
      }
    }

    match.teams = match.teams.map(curr => {
      const teamFromDb = _.find(teams, { _id: curr.id });
      return { ...curr, ...teamFromDb };
    });

    match.league = { ...match.league, ...league };

    const matchInfo = { match, tokens, bet };

    res.send(matchInfo);
  });
};
