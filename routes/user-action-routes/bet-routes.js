const mongoose = require('mongoose');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');
const Token = mongoose.model('token');
const userHaveEnoughBalance = require('../../utils/userHaveEnoughBalance');
const chargeUser = require('../../utils/chargeUser');
const userAlreadyBet = require('../../helpers/bet/userAlreadyBet');
const updateMatchWithBet = require('../../helpers/bet/updateMatchWithBet');
const estimateBetValue = require('../../helpers/bet/estimateBetValue');
const PricesMap = require('../../utils/pricesMap');
const removeEmptyBalances = require('../../utils/removeEmptyBalances');
const updateMatchData = require('../../helpers/match/updateMatchData');
const _ = require('lodash');

let usersBeingHandled = [];

module.exports = server => {
  server.post('/place_bet', async (req, res) => {
    const { matchID, teamID, betMakerID, tokensBet } = req.body;

    let user = await User.findById(betMakerID).exec();

    const alreadyBet = await userAlreadyBet(user, matchID);

    if (
      !userHaveEnoughBalance(user, tokensBet) ||
      alreadyBet ||
      usersBeingHandled.includes(betMakerID) ||
      tokensBet.length > 4
    ) {
      res.send(null);
    } else {
      // Lock route for user to prevent double-betting
      usersBeingHandled.push(betMakerID);

      const supportedTokens = await Token.find({});
      const pricesMap = await PricesMap(supportedTokens);

      const estimatedBetValue = await estimateBetValue(
        tokensBet,
        supportedTokens,
        pricesMap
      );

      await chargeUser(user, tokensBet, false);

      const bet = await new Bet({
        matchID,
        teamID,
        betMakerID,
        tokensBet,
        estimatedBetValue
      }).save();

      await updateMatchWithBet(matchID, bet, supportedTokens, pricesMap);

      await removeEmptyBalances(user);

      user.bets.push(bet._id);
      await user.save();

      await updateMatchData(matchID, supportedTokens, pricesMap);

      res.send({ bet });

      // Unlock route for user
      usersBeingHandled = _.pull(usersBeingHandled, betMakerID);
    }
  });

  server.post('/set_displayed_bet', (req, res) => {
    const betID = req.body.betID;

    Bet.findById(betID, async (err, bet) => {
      if (err) return;
      if (!bet) return;

      bet.displayedToUser = true;
      await bet.save();
    });

    res.send();
  });
};
