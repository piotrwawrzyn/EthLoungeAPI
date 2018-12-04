const mongoose = require('mongoose');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');
const _ = require('lodash');
const Big = require('big.js');

const returnBets = async (match, team = null) => {
  let bets = await Bet.find({ matchID: match._id })
    .lean()
    .exec();

  // If team is null return bets to all gamblers, if not return bets to gamblers that bet on a given team

  if (team !== null) {
    bets = bets.filter(bet => bet.teamID === team._id);
  }

  for (bet of bets) {
    const { betMakerID, tokensBet } = bet;
    const gambler = await User.findById(betMakerID).exec();

    for (token of tokensBet) {
      const balance = _.find(gambler.balances, { id: token.id });

      if (balance)
        Big(balance.balance)
          .plus(token.amount)
          .toFixed();
      else gambler.balances.push({ id: token.id, balance: token.amount });
    }

    gambler.markModified('balances');
    await gambler.save();
  }
};

module.exports = returnBets;
