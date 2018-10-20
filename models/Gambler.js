const mongoose = require('mongoose');
const { Schema } = mongoose;

const gamblerSchema = new Schema({
  address: String,
  bets: [
    {
      matchID: Number,
      teamID: Number,
      tokens: [
        {
          address: String,
          amount: String
        }
      ]
    }
  ]
});

mongoose.model('gambler', gamblerSchema);
