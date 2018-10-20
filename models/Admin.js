const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const keys = require('../config/keys');

const adminSchema = new Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String
});

adminSchema.methods.generateHash = password => {
  return bcrypt.hash(password, bcrypt.genSaltSync(8), null);
};

adminSchema.methods.validPassword = (password, actualPassword) => {
  return bcrypt.compareSync(password, actualPassword);
};

const Admin = mongoose.model('admin', adminSchema);

const { initUsername, initPassword } = keys;

Admin.findOne({ username: initUsername }, async (err, user) => {
  if (!user) {
    const initial_user = new Admin({ username: initUsername });
    initial_user.password = await initial_user.generateHash(initPassword);
    initial_user.save();
  }
});
