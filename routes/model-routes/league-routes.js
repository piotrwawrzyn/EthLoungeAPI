const mongoose = require('mongoose');
const League = mongoose.model('league');
const fs = require('fs');
const signedIn = require('../middleware/signedIn');

module.exports = server => {
  server.get('/api/leagues', async (req, res) => {
    if (req.query.apiID) {
      const apiID = req.query.apiID;
      League.findOne({ apiID }, (err, league) => {
        if (err) res.send(err);
        if (!league) res.send({ league: null });
        else res.send(league);
      });

      return;
    }

    const leagues = await League.find({});
    res.send(leagues);
  });
};
