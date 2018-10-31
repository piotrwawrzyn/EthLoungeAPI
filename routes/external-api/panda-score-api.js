const axios = require('axios');
const signedIn = require('../middleware/signedIn');
const { panda_score_api_key } = require('../../config/keys');
const CircularJSON = require('circular-json');

module.exports = server => {
  server.get('/api/pandascore/upcoming_matches', signedIn, (req, res) => {
    const response = axios
      .get(
        `https://api.pandascore.co/csgo/matches/upcoming?token=${panda_score_api_key}`
      )
      .then(response => res.send(CircularJSON.stringify(response)));
  });
};
