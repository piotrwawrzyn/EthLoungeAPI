const mongoose = require('mongoose');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');
const Token = mongoose.model('token');
const UserHaveEnoughBalance = require('../../utils/UserHaveEnoughBalance');
const ChargeUser = require('../../utils/ChargeUser');
const UserAlreadyBet = require('../../utils/bet/UserAlreadyBet');
const UpdateMatchWithBet = require('../../utils/bet/UpdateMatchWithBet');
const EstimateBetValue = require('../../utils/bet/EstimateBetValue');
const PricesMap = require('../../utils/PricesMap');
const RemoveEmptyBalances = require('../../utils/RemoveEmptyBalances');
const _ = require('lodash');

let usersBeingHandled = [];

module.exports = server => {
  server.post('/place_bet', async (req, res) => {
    const { matchID, teamID, betMakerID, tokensBet } = req.body;

    let user = await User.findById(betMakerID).exec();

    const alreadyBet = await UserAlreadyBet(user, matchID);

    if (
      !UserHaveEnoughBalance(user, tokensBet) ||
      alreadyBet ||
      usersBeingHandled.includes(betMakerID)
    ) {
      res.send(null);
    } else {
      // Lock route for user to prevent double-betting
      usersBeingHandled.push(betMakerID);

      const supportedTokens = await Token.find({});
      const pricesMap = await PricesMap(supportedTokens);

      const estimatedBetValue = await EstimateBetValue(
        tokensBet,
        supportedTokens,
        pricesMap
      );

      await ChargeUser(user, tokensBet, false);

      const bet = await new Bet({
        matchID,
        teamID,
        betMakerID,
        tokensBet,
        estimatedBetValue
      }).save();

      await UpdateMatchWithBet(matchID, bet, supportedTokens, pricesMap);
      await RemoveEmptyBalances(user);

      user.bets.push(bet._id);
      await user.save();

      res.send({ bet });

      // Unlock route for user
      usersBeingHandled = _.pull(usersBeingHandled, betMakerID);
    }
  });
};
