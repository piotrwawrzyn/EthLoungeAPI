const mongoose = require('mongoose');
const Token = mongoose.model('token');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');
const Match = mongoose.model('match');
const Team = mongoose.model('team');
const League = mongoose.model('league');
const _ = require('lodash');
const fillInfo = require('../../utils/fillInfo');

module.exports = server => {
  server.get('/api/match_info', async (req, res) => {
    const matchID = parseInt(req.query.id);

    let match = await Match.findById(matchID, (err, match) => {
      if (err || !match) {
        res.send(null);
        return;
      }

      return match;
    })
      .lean()
      .exec();

    const betsCount = match.bets.length;

    match.numberOfBets = betsCount;

    const NUMBER_OF_BETS_TO_SEND = 10;

    let lastBets =
      betsCount > NUMBER_OF_BETS_TO_SEND
        ? match.bets.slice(betsCount - 10)
        : match.bets;

    lastBets = await Bet.find({ _id: { $in: lastBets } })
      .lean()
      .exec();

    lastBetsUsers = lastBets.map(bet => bet.betMakerID);

    lastBetsUsers = await User.find({ _id: { $in: lastBetsUsers } })
      .lean()
      .exec();

    lastBets = lastBets.map(bet => {
      bet.betMakerUsername = _.find(lastBetsUsers, {
        _id: bet.betMakerID
      }).username;
      return bet;
    });

    const teams = await Team.find({
      _id: { $in: [match.teams[0].id, match.teams[1].id] }
    })
      .lean()
      .exec();

    const league = await League.findById(match.league)
      .lean()
      .exec();

    const tokens = await Token.find({})
      .lean()
      .exec();

    // Did User bet on this match?
    let bet = false;
    let user = false;
    if (req.user) {
      user = await User.findById({ _id: req.user.id })
        .lean()
        .exec();
      user = { ...user, password: undefined };
      if (user.balances.length > 0)
        user.balances = fillInfo(user.balances, tokens);

      const all_bets_by_user = await Bet.find({
        _id: { $in: user.bets }
      })
        .lean()
        .exec();

      for (let i = 0; i < all_bets_by_user.length; i++) {
        if (all_bets_by_user[i].matchID === matchID) {
          bet = all_bets_by_user[i];
          bet.tokensBet = fillInfo(bet.tokensBet, tokens);
          bet.team = fillInfo(bet.teamID, teams);
          bet.tokensWon = fillInfo(bet.tokensWon, tokens);
          break;
        }
      }
    }

    for (lastBet of lastBets) {
      lastBet.tokensBet = fillInfo(lastBet.tokensBet, tokens);
      lastBet.team = fillInfo(lastBet.teamID, teams);
    }

    match.teams = fillInfo(match.teams, teams);

    match.league = { ...match.league, ...league };

    match.bets = lastBets.reverse();

    user.bet = bet;

    const matchProps = { match, tokens, user };

    res.send(matchProps);
  });
};
