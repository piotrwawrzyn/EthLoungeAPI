const mongoose = require('mongoose');
const League = mongoose.model('league');
const fs = require('fs');
const signedIn = require('../middleware/signedIn');
const SaveImage = require('../../utils/SaveImage');
const DeleteImage = require('../../utils/DeleteImage');

module.exports = server => {
  server.get('/api/leagues', async (req, res) => {
    if (req.query.pandaID) {
      const pandaID = req.query.pandaID;
      console.log(pandaID);
      League.findOne({ pandaID }, (err, league) => {
        if (err) res.send(err);
        if (!league) res.send({ league: null });
        else res.send({ league });
      });

      return;
    }

    const leagues = await League.find({});
    res.send(leagues);
  });

  server.post('/backend/new_league', (req, res) => {
    let logo = req.files ? req.files.logo : req.body.logo;
    const { displayName, pandaID } = req.body;
    let new_league;

    League.findOne({ displayName: displayName }, async (err, league) => {
      if (!league) {
        new_league = await new League({ displayName, pandaID }).save();
        SaveImage(logo, `leagues/${new_league._id}`);
      }

      res.send({ league: new_league });
    });
  });

  server.post('/backend/update_league', (req, res) => {
    let logo = req.files ? req.files.logo : '';
    const { displayName, id, pandaID } = req.body;

    League.findById({ _id: id }, async (err, league) => {
      if (err) res.send(err);
      if (logo) logo.mv(`${root}/public/img/leagues/${id}.png`);
      league.displayName = displayName ? displayName : league.displayName;
      league.pandaID = pandaID ? pandaID : league.pandaID;
      league.save();

      res.send();
    });
  });

  server.post('/backend/delete_league', (req, res) => {
    const { id } = req.body;
    League.deleteOne({ _id: id }).exec();

    DeleteImage(`leagues/${id}.png`);

    res.send();
  });
};
