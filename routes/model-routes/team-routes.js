const mongoose = require('mongoose');
const Team = mongoose.model('team');
const fs = require('fs');
const SaveImage = require('../../utils/SaveImage');
const signedIn = require('../middleware/signedIn');
const DeleteImage = require('../../utils/DeleteImage');

module.exports = server => {
  server.get('/api/teams', async (req, res) => {
    if (req.query.apiID) {
      const apiID = req.query.apiID;
      Team.findOne({ apiID }, (err, team) => {
        if (err) res.send(err);
        if (!team) res.send({ team: null });
        else res.send(team);
      });

      return;
    }

    const teams = await Team.find({});
    res.send(teams);
  });

  server.post('/backend/new_team', (req, res) => {
    let logo = req.files ? req.files.logo : req.body.logo;
    const { displayName } = req.body;
    let success = false;

    Team.findOne({ displayName: displayName }, async (err, team) => {
      if (!team) {
        const new_team = await new Team({ displayName }).save();
        SaveImage(logo, `teams/${new_team._id}`);
        success = true;
      }

      if (err) success = false;

      res.send({ success: success });
    });
  });

  server.post('/backend/update_team', (req, res) => {
    let logo = req.files ? req.files.logo : '';
    const { displayName, id } = req.body;

    Team.findById({ _id: id }, async (err, team) => {
      if (err) res.send(err);
      if (logo) logo.mv(`${root}/public/img/teams/${id}.png`);
      team.displayName = displayName;
      team.save();

      res.send();
    });
  });

  server.post('/backend/delete_team', (req, res) => {
    const { id } = req.body;
    Team.deleteOne({ _id: id }).exec();

    DeleteImage(`teams/${id}.png`);

    res.send();
  });
};
