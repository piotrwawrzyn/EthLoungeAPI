const mongoose = require('mongoose');
const Team = mongoose.model('team');
const saveImage = require('../../utils/saveImage');
const deleteImage = require('../../utils/deleteImage');
const IMAGE_FOLDER_PATH = 'teams';

module.exports = server => {
  server.get('/api/teams', async (req, res) => {
    if (req.query.pandaID) {
      const pandaID = req.query.pandaID;
      Team.findOne({ pandaID }, (err, team) => {
        if (err) res.send(err);
        if (!team) res.send({ team: null });
        else res.send({ team });
      });

      return;
    }

    const teams = await Team.find({});
    res.send(teams);
  });

  server.post('/backend/new_team', (req, res) => {
    let logo = req.files ? req.files.logo : req.body.logo;
    let { displayName, pandaID } = req.body;
    if (pandaID === 'undefined') pandaID = undefined;
    let new_team;

    Team.findOne({ displayName }, async (err, team) => {
      if (!team) {
        new_team = await new Team({ displayName, pandaID }).save();
        const { _id } = new_team;
        new_team.logo = await saveImage(
          logo,
          IMAGE_FOLDER_PATH,
          `${_id}_${displayName}`
        );
        new_team.save();
      }

      res.send({ team: new_team });
    });
  });

  server.post('/backend/update_team', (req, res) => {
    let logo = req.files ? req.files.logo : '';
    const { displayName, id } = req.body;

    Team.findById({ _id: id }, async (err, team) => {
      if (err) res.send(err);
      team.displayName = displayName ? displayName : team.displayName;

      if (logo) {
        await deleteImage(team.logo);
        team.logo = await saveImage(
          logo,
          IMAGE_FOLDER_PATH,
          `${id}_${team.displayName}`
        );
      }

      team.save();

      res.send();
    });
  });

  server.post('/backend/delete_team', (req, res) => {
    const { id } = req.body;
    Team.findByIdAndDelete(id, async (err, team) => {
      const { logo } = team;
      await deleteImage(logo);
    });

    res.send();
  });
};
