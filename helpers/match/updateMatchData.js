const mongoose = require('mongoose');
const Match = mongoose.model('match');
const Bet = mongoose.model('bet');
const Token = mongoose.model('token');
const _ = require('lodash');
const Big = require('big.js');
const tokenFromWei = require('../../utils/tokenFromWei');
const calculatePercentages = require('../bet/calculatePercentages');
const calculateOdds = require('../bet/calculateOdds');
const PricesMap = require('../../utils/pricesMap');

module.exports = async (matchID, supportedTokens, pricesMap) => {
  if (!supportedTokens) supportedTokens = await Token.find({});
  if (!pricesMap) pricesMap = await PricesMap(supportedTokens);

  const match = await Match.findById(matchID).exec();
  let bets = await Bet.find({ _id: { $in: match.bets } }).exec();

  // Update estimatedBetValue's, total $ bet, highest bet
  let totalDollarsBet = [Big(0), Big(0)];

  let highestBet = 0;
  for (bet of bets) {
    let betValue = Big(0);
    for (let i = 0; i < bet.tokensBet.length; i++) {
      const { id, amount } = bet.tokensBet[i];
      const supportedToken = _.find(supportedTokens, {
        _id: id
      });
      const { decimals, symbol } = supportedToken;
      const price = pricesMap.get(symbol).USD;
      const value = tokenFromWei(amount, decimals).mul(price);

      if (bet.teamID === match.teams[0].id) {
        totalDollarsBet[0] = totalDollarsBet[0].plus(value);
      } else {
        totalDollarsBet[1] = totalDollarsBet[1].plus(value);
      }

      betValue = betValue.plus(value);
    }

    bet.estimatedBetValue = betValue.toFixed(3);

    await bet.save();

    if (betValue.cmp(highestBet) === 1) highestBet = betValue;
  }

  totalDollarsBet = totalDollarsBet.map(amount => amount.toFixed(3));

  const percentages = calculatePercentages(totalDollarsBet);
  const odds = calculateOdds(totalDollarsBet);

  for (let i = 0; i < 2; i++) {
    match.teams[i].totalDollarsBet = totalDollarsBet[i];
    match.teams[i].percentages = percentages[i];
    match.teams[i].odds = odds[i];
  }

  match.highestBet = highestBet.toFixed(3);

  await match.save();
};
