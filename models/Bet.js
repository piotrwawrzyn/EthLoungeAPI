const mongoose = require('mongoose');
const { Schema } = mongoose;
const { plugin } = require('mongoose-auto-increment');

const betSchema = new Schema({
  matchID: Number,
  teamID: Number,
  betMakerID: Number,
  estimatedBetValue: Number,
  winningsValue: Number,
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
  state: { type: String, default: 'pending' },
  displayedToUser: Boolean,
  logs: [String]
});

betSchema.plugin(plugin, 'bet');
mongoose.model('bet', betSchema);
