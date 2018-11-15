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
      id: Number,
      balance: String,
      _id: false
    }
  ],
  bets: [],
  permissions: [String],
  permalink: String,
  verificationToken: String,
  verified: { type: Boolean, default: false }
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
      verified: true,
      balances: [
        { id: 0, balance: '2000000000' },
        { id: 1, balance: '300000000' },
        { id: 2, balance: '1000000000000000000' },
        { id: 3, balance: '10000000000000000000' }
      ]
    });
    initial_user.password = await initial_user.generateHash(initPassword);
    initial_user.save();
  }
});
