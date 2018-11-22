const mongoose = require('mongoose');
const Match = mongoose.model('match');

module.exports = server => {
  server.get('/backend/matches', async (req, res) => {
    if (req.query.id) {
      const id = req.query.id;
      Match.findOne({ _id: id }, async (err, match) => {
        if (err) res.send(err);
        if (!match) res.send({ match: null });
        else {
          res.send({ match });
        }
      });

      return;
    }

    const matches = await Match.find({});
    res.send(matches);
  });

  server.post('/backend/new_match', async (req, res) => {
    const {
      teams,
      league,
      startTime,
      pandaID,
      numberOfGames,
      serie
    } = req.body;

    Match.findOne({ startTime: startTime }, async (err, match) => {
      if (err) res.send(err);
      if (match && JSON.stringify(teams) === JSON.stringify(match.teams)) {
        res.send({ team: null });
        return;
      } else {
        const new_match = await new Match({
          teams,
          league,
          startTime,
          pandaID,
          numberOfGames,
          serie
        }).save();

        res.send({ match: new_match });
      }
    });
  });
};
