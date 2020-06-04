const mongoose = require('mongoose');
const Token = mongoose.model('token');
const User = mongoose.model('user');

module.exports = server => {
  /**
   * This should response with all tokens on the page and tokens available for the current user
   */
  server.get('/api/deposit_info', async (req, res) => {
    if (!req.user) {
      res.send({ signedIn: false });
      return;
    }

    const allTokens = await Token.find({}).lean().exec();

    const user_id = req.user.id;
    const user = await User.findById(user_id).lean().exec();

    const depositProps = { allTokens, userBalances: user.balances };

    res.send(depositProps);
  });
};
