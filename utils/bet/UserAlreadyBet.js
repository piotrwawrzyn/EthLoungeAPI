const _ = require('lodash');
const Big = require('big.js');
const mongoose = require('mongoose');
const Bet = mongoose.model('bet');

const UserAlreadyBet = async (user, matchID) => {
  if (!user.bets) return false;
  const { bets } = user;

  const betsFromDb = await Bet.find({ _id: { $in: bets } }).exec();
  const bet = _.find(betsFromDb, { matchID });
  if (bet) return true;
  return false;
};

module.exports = UserAlreadyBet;
