const mongoose = require('mongoose');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');
const Token = mongoose.model('token');
const userHaveEnoughBalance = require('../../utils/userHaveEnoughBalance');
const chargeUser = require('../../utils/chargeUser');
const userAlreadyBet = require('../../utils/bet/userAlreadyBet');
const updateMatchWithBet = require('../../utils/bet/updateMatchWithBet');
const estimateBetValue = require('../../utils/bet/estimateBetValue');
const PricesMap = require('../../utils/pricesMap');
const removeEmptyBalances = require('../../utils/removeEmptyBalances');
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
      usersBeingHandled.includes(betMakerID)
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

      res.send({ bet });

      // Unlock route for user
      usersBeingHandled = _.pull(usersBeingHandled, betMakerID);
    }
  });
};
