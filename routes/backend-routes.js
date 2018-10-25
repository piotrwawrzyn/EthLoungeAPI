const mongoose = require('mongoose');
const Team = mongoose.model('team');
const fs = require('fs');

module.exports = server => {
  const signedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/404');
    }
  };

  server.get('/api/teams', signedIn, async (req, res) => {
    const teams = await Team.find({});
    res.send(teams);
  });

  server.post('/backend/new_team', signedIn, (req, res) => {
    let logo = req.files.logo;
    let displayName = req.body.displayName;
    let success = false;

    Team.findOne({ displayName: displayName }, async (err, team) => {
      if (!team) {
        const new_team = await new Team({ displayName }).save();
        logo.mv(`${root}/public/img/teams/${new_team.id}.png`);
        success = true;
      }

      if (err) success = false;

      res.send({ success: success });
    });
  });

  server.post('/backend/update_team', signedIn, (req, res) => {
    let logo = req.files ? req.files.logo : '';
    let displayName = req.body.displayName;
    let id = req.body.id;

    Team.findById({ _id: id }, async (err, team) => {
      if (err) res.send(err);
      if (logo) logo.mv(`${root}/public/img/teams/${id}.png`);
      team.displayName = displayName;
      team.save();

      res.send();
    });
  });

  server.post('/backend/delete_team', signedIn, (req, res) => {
    const { id } = req.body;
    Team.deleteOne({ _id: id }).exec();
    fs.unlink(`${root}/public/img/teams/${id}.png`);
    res.send();
  });
};
