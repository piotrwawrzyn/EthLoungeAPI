const axios = require('axios');
const { panda_score_api_key } = require('../../config/keys');
const CircularJSON = require('circular-json');

module.exports = server => {
  server.get('/api/pandascore/upcoming_matches', (req, res) => {
    axios
      .get(
        `https://api.pandascore.co/csgo/matches/upcoming?token=${panda_score_api_key}`
      )
      .then(response => res.send(CircularJSON.stringify(response)));
  });
};
