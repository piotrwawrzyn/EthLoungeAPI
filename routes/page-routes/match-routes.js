const mongoose = require('mongoose');
const Token = mongoose.model('token');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');
const Match = mongoose.model('match');
const Team = mongoose.model('team');
const League = mongoose.model('league');

module.exports = server => {
  server.get('/api/match_info', async (req, res) => {
    const matchID = req.query.id;

    const match = await Match.findById(matchID, (err, match) => {
      if (err || !match) {
        res.send(null);
        return;
      }

      return match;
    });

    const tokens = await Token.find({});
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

    const league = await League.findById(match.league).exec();
    const teams = await Team.find({
      _id: { $in: [match.teams[0].id, match.teams[1].id] }
    }).exec();
    const matchInfo = { match, teams, league, tokens, bet };

    res.send(matchInfo);
  });
};
