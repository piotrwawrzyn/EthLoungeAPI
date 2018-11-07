const mongoose = require('mongoose');
const { Schema } = mongoose;
const { plugin } = require('mongoose-auto-increment');

const betSchema = new Schema({
  matchID: Number,
  teamID: Number,
  betMakerID: Number,
  estimatedBetValue: Number,
  estimatedRewardValue: { type: Number, default: 0 },
  tokensBet: [
    {
      id: Number,
      amount: String,
      _id: false
    }
  ],
  tokensWon: [
    {
      id: Number,
      amount: String,
      _id: false
    }
  ],
  state: { type: String, default: 'pending' }
});

betSchema.plugin(plugin, 'bet');
mongoose.model('bet', betSchema);
