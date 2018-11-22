const mongoose = require('mongoose');
const Match = mongoose.model('match');
const axios = require('axios');
const keys = require('../config/keys');
const _ = require('lodash');
let dynamicConfig,
  { pandaAPI } = require('../config/dynamicConfig');

updateScheduledMatches = async () => {
  let matchesDb = await Match.find({ state: 'scheduled' }).exec();
  const matchesIds = matchesDb.map(match => match.pandaID);

  const api_link = `https://api.pandascore.co/csgo/matches?token=${
    keys.panda_score_api_key
  }&filter[id]=${matchesIds}`;

  const response = await axios(api_link);
  const matchesInApi = response.data;

  for (matchInApi of matchesInApi) {
    let dbCounterpart = await Match.findOne({ pandaID: matchInApi.id }).exec();

    if (pandaAPI.automaticRescheduling) {
      // Reschedule matches from API
      const dateInDb = dbCounterpart.startTime;
      const dateInApi = new Date(matchInApi.begin_at);

      if (dateInDb.getTime() !== dateInApi.getTime()) {
        console.log(
          `Changing start time for match ${
            dbCounterpart._id
          }. Rescheduling from ${dateInDb} to ${dateInApi}.`
        );
        dbCounterpart.startTime = dateInApi;
        await dbCounterpart.save();
      }
    }
  }

  setTimeout(updatePrices, 1000 * 60 * 5);
};

updateScheduledMatches();
