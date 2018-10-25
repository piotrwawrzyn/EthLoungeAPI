const mongoose = require('mongoose');
const Team = mongoose.model('team');

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
    console.log(teams);
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
};
