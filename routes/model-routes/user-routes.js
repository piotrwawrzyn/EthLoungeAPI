const mongoose = require('mongoose');
const User = mongoose.model('user');

module.exports = server => {
  server.get('/api/users', async (req, res) => {
    const users = await User.find({})
      .sort({ _id: 1 })
      .lean()
      .exec();

    res.send(users);
  });
};
