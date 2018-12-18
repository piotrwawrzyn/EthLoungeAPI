const mongoose = require('mongoose');
const Token = mongoose.model('token');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');
const Match = mongoose.model('match');
const Team = mongoose.model('team');
const League = mongoose.model('league');
const _ = require('lodash');
const fillInfo = require('../../../utils/fillInfo');

module.exports = server => {
  server.get('/api/user_info', async (req, res) => {
    const userID = parseInt(req.query.id);

    const user = await User.findById(userID, (err, user) => {
      if (err || !user) {
        res.send(null);
        return;
      }

      return user;
    })
      .lean()
      .exec();

    const bets = await Bet.find({ _id: { $in: user.bets } })
      .lean()
      .exec();

    const tokens = await Token.find({})
      .lean()
      .exec();

    const matchIDs = bets.map(bet => bet.matchID);

    const matches = await Match.find({ _id: { $in: matchIDs } })
      .lean()
      .exec();
    const teams = await Team.find({})
      .lean()
      .exec();
    const leagues = await League.find({})
      .lean()
      .exec();

    let userBets = fillInfo(user.bets, bets);

    userBets = userBets.map(bet => {
      bet.match = fillInfo(bet.matchID, matches);
      bet.match.teams = fillInfo(bet.match.teams, teams);
      bet.match.league = fillInfo(bet.match.league, leagues);
      return bet;
    });

    const userInDb = {
      username: user.username,
      email: user.email,
      signupDate: user.signupDate,
      bets: userBets,
      balances: fillInfo(user.balances, tokens)
    };

    res.send({ userInDb: userInDb });
  });
};
