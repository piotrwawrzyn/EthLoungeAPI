const mongoose = require('mongoose');
const { Schema } = mongoose;
const { plugin } = require('mongoose-auto-increment');

const matchSchema = new Schema({
  displayName: String,
  teamsID: [Number],
  startTime: Date
});

matchSchema.plugin(plugin, 'match');
mongoose.model('match', matchSchema);
