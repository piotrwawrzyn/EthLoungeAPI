const mongoose = require('mongoose');
const { Schema } = mongoose;
const { plugin } = require('mongoose-auto-increment');

const leagueSchema = new Schema({
  displayName: String,
  pandaID: Number,
  logo: String
});

leagueSchema.plugin(plugin, 'league');
mongoose.model('league', leagueSchema);
