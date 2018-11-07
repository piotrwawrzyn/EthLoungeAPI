const mongoose = require('mongoose');
const Match = mongoose.model('match');
const Bet = mongoose.model('bet');
const Token = mongoose.model('token');
const _ = require('lodash');
const Big = require('big.js');
const TokenFromWei = require('../TokenFromWei');
const CalculatePercentages = require('./CalculatePercentages');
const CalculateOdds = require('./CalculateOdds');

module.exports = async (matchID, userBet, supportedTokens, pricesMap) => {
  const match = await Match.findById(matchID).exec();
  let bets = await Bet.find({ _id: { $in: match.bets } }).exec();
  console.log(match, bets);
  //Push bet localy
  bets.push(userBet);

  if (!supportedTokens) supportedTokens = await Token.find({});

  if (!pricesMap) pricesMap = await PricesMap(supportedTokens);

  const { tokensInPool } = match;

  // Add new tokens to tokensInPool
  for (token of userBet.tokensBet) {
    const { id } = token;
    if (!tokensInPool.includes(id)) tokensInPool.push(id);
  }

  // Update total $ bet and highest bet
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
      const value = TokenFromWei(amount, decimals).mul(price);

      if (bet.teamID === match.teams[0].id) {
        totalDollarsBet[0] = totalDollarsBet[0].plus(value);
      } else {
        totalDollarsBet[1] = totalDollarsBet[1].plus(value);
      }

      betValue = betValue.plus(value);
    }

    if (betValue.cmp(highestBet) === 1) highestBet = betValue;
  }

  totalDollarsBet = totalDollarsBet.map(amount => amount.toFixed(2));

  const percentages = CalculatePercentages(totalDollarsBet);
  const odds = CalculateOdds(totalDollarsBet);

  for (let i = 0; i < 2; i++) {
    match.teams[i].totalDollarsBet = totalDollarsBet[i];
    match.teams[i].percentages = percentages[i];
    match.teams[i].odds = odds[i];
  }

  match.highestBet = highestBet.toFixed(2);

  // Push bet
  match.bets.push(userBet._id);
  match.save();
};
