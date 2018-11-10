const mongoose = require('mongoose');
const { Schema } = mongoose;
const { plugin } = require('mongoose-auto-increment');

const teamSchema = new Schema({
  displayName: String,
  pandaID: Number,
  logo: String
});

teamSchema.plugin(plugin, 'team');
mongoose.model('team', teamSchema);
