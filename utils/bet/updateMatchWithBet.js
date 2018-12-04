const mongoose = require('mongoose');
const Match = mongoose.model('match');
const Bet = mongoose.model('bet');
const Token = mongoose.model('token');
const _ = require('lodash');

module.exports = async (matchID, userBet, supportedTokens, pricesMap) => {
  const match = await Match.findById(matchID).exec();
  let bets = await Bet.find({ _id: { $in: match.bets } }).exec();

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

  // Push bet
  match.bets.push(userBet._id);
  await match.save();
};
