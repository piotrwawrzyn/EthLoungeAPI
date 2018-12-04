const mongoose = require('mongoose');
const { Schema } = mongoose;
const { plugin } = require('mongoose-auto-increment');
const { FEE_MULTIPLIER } = require('../config/constants');

const matchSchema = new Schema({
  teams: [
    {
      id: Number,
      totalDollarsBet: { type: Number, default: 0 },
      odds: { type: Number, default: (2 * FEE_MULTIPLIER).toFixed(2) },
      percentages: { type: Number, default: 50 },
      _id: false
    }
  ],
  state: { type: String, default: 'scheduled' },
  bets: [],
  tokensInPool: [],
  highestBet: { type: Number, default: 0 },
  league: Number,
  startTime: Date,
  pandaID: Number,
  numberOfGames: Number,
  serie: String,
  winnerID: Number
});

matchSchema.plugin(plugin, 'match');
mongoose.model('match', matchSchema);
