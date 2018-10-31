const mongoose = require('mongoose');
const { Schema } = mongoose;
const { plugin } = require('mongoose-auto-increment');

const matchSchema = new Schema({
  teamsID: [String],
  startTime: Date,
  pandaID: String
});

matchSchema.plugin(plugin, 'match');
mongoose.model('match', matchSchema);
