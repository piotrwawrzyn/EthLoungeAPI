const mongoose = require('mongoose');
const { Schema } = mongoose;
const keys = require('../config/keys');
const bcrypt = require('bcryptjs');
const { plugin } = require('mongoose-auto-increment');

const userSchema = new Schema({
  username: String,
  password: String,
  balances: [
    {
      symbol: String,
      balance: String,
      _id: false
    }
  ],
  bets: {
    active: [String],
    historical: [String]
  },
  permissions: [String]
});

userSchema.methods.generateHash = password => {
  return bcrypt.hash(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = (password, actualPassword) => {
  return bcrypt.compareSync(password, actualPassword);
};

userSchema.plugin(plugin, 'user');
const User = mongoose.model('user', userSchema);

const { initUsername, initPassword } = keys;

User.findOne({ username: initUsername }, async (err, user) => {
  if (!user) {
    const initial_user = new User({
      username: initUsername,
      permissions: ['admin'],
      balances: [
        { symbol: 'ETH', balance: '100000' },
        { symbol: 'POWR', balance: '1000' }
      ]
    });
    initial_user.password = await initial_user.generateHash(initPassword);
    initial_user.save();
  }
});
