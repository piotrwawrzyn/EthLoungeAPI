const mongoose = require('mongoose');
const Match = mongoose.model('match');
const Bet = mongoose.model('bet');
const Token = mongoose.model('token');
const _ = require('lodash');
const Big = require('big.js');
const TokenFromWei = require('../TokenFromWei');

module.exports = async (matchID, userBet, supportedTokens, pricesMap) => {
  const match = await Match.findById(matchID).exec();
  let bets = await Bet.find({ _id: { $in: match.bets } }).exec();

  //Push bet localy
  bets.push(userBet);

  if (!supportedTokens) supportedTokens = await Token.find({});

  if (!pricesMap) pricesMap = await PricesMap(supportedTokens);

  const { highestBet, tokensInPool } = match;

  // Add new tokens to tokensInPool
  for (token of userBet.tokensBet) {
    const { id } = token;
    if (!tokensInPool.includes(id)) tokensInPool.push(id);
  }

  // Update total $ bet
  let totalDollarsBet = [Big(0), Big(0)];
  for (bet of bets) {
    for (let i = 0; i < bet.tokensBet.length; i++) {
      const { id, amount } = bet.tokensBet[i];
      const supportedToken = _.find(supportedTokens, {
        _id: id
      });
      const { decimals, symbol } = supportedToken;
      const price = pricesMap.get(symbol).USD;

      if (bet.teamID === match.teams[0].id) {
        totalDollarsBet[0] = totalDollarsBet[0].plus(
          TokenFromWei(amount, decimals).mul(price)
        );
      } else {
        totalDollarsBet[1] = totalDollarsBet[1].plus(
          TokenFromWei(amount, decimals).mul(price)
        );
      }
    }
  }

  totalDollarsBet = totalDollarsBet.map(amount => amount.toFixed(3));
  match.teams[0].totalDollarsBet = totalDollarsBet[0];
  match.teams[1].totalDollarsBet = totalDollarsBet[1];

  // Push bet
  match.bets.push(userBet._id);
  match.save();
};
