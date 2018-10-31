const mongoose = require('mongoose');
const { Schema } = mongoose;
const { plugin } = require('mongoose-auto-increment');

const betSchema = new Schema({
  matchID: String,
  betMakerID: String,
  tokensBet: {
    symbol: String,
    balance: String
  },
  tokensWon: {
    symbol: String,
    balance: String
  },
  result: String
});

betSchema.plugin(plugin, 'bet');
mongoose.model('bet', betSchema);
