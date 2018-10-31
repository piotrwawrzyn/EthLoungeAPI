const mongoose = require('mongoose');
const Token = mongoose.model('token');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');

module.exports = server => {
  server.get('/api/match_info', async (req, res) => {
    const matchID = req.query.ID;
    const tokens = await Token.find({});
    let bet = false;

    if (req.user) {
      const user = await User.findById({ _id: req.user.id });

      const bets = await Bet.find({ _id: { $in: user.bets.active } });

      for (let i = 0; i < bets.length; i++) {
        if (bets[i].matchID === matchID) {
          bet = curr;
          break;
        }
      }
    }

    const matchInfo = { tokens, bet };

    res.send(matchInfo);
    // match + tokens + bet
  });

  server.post('/place_bet', (req, res) => {
    const { betMakerID, tokensBet } = req.body;

    // Check if someone can place this bet

    // placeBet
  });
};
