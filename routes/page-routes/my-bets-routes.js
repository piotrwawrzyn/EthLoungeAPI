const mongoose = require('mongoose');
const Match = mongoose.model('match');
const Team = mongoose.model('team');
const League = mongoose.model('league');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');
const Token = mongoose.model('token');
const fillInfo = require('../../utils/fillInfo');
const { MATCHES_PER_PAGE } = require('../../config/constants');
const sortMatches = require('../../helpers/match/sortMatches');

module.exports = server => {
  server.get('/api/my_bets', async (req, res) => {
    if (!req.user) {
      res.send({ signedIn: false });
      return;
    }
    const user_id = req.user.id;
    const user = await User.findById(user_id)
      .lean()
      .exec();
    let bets = await Bet.find({ _id: { $in: user.bets } })
      .lean()
      .exec();
    const matches = await Match.find({
      _id: { $in: bets.map(bet => bet.matchID) }
    })
      .lean()
      .exec();

    const leagues = await League.find({})
      .lean()
      .exec();
    const teams = await Team.find({})
      .lean()
      .exec();
    const tokens = await Token.find({})
      .lean()
      .exec();

    for (bet of bets) {
      bet.match = fillInfo(bet.matchID, matches);
      if (bet.match !== undefined) {
        bet.match.league = fillInfo(bet.match.league, leagues);
        bet.match.teams = fillInfo(bet.match.teams, teams);
        if (bet.match.winnerID !== undefined)
          bet.match.winner = fillInfo(bet.match.winnerID, teams);
        bet.match.bets = undefined;
      }
      bet.tokensBet = fillInfo(bet.tokensBet, tokens);
      bet.team = fillInfo(bet.teamID, teams);
    }

    bets = bets.filter(bet => bet.match !== undefined);

    const pendingBets = bets.filter(bet => bet.state === 'pending');
    const finalizedBets = bets
      .filter(bet => bet.state !== 'pending')
      .sort(
        (a, b) => new Date(b.match.startTime) - new Date(a.match.startTime)
      );

    res.send({ pendingBets, finalizedBets });
  });
};
