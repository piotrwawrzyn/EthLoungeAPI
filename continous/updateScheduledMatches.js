const mongoose = require('mongoose');
const Match = mongoose.model('match');
const Team = mongoose.model('team');
const axios = require('axios');
const keys = require('../config/keys');
const _ = require('lodash');
let dynamicConfig,
  { pandaAPI } = require('../config/dynamicConfig');
const finalizeMatch = require('../helpers/match/finalizeMatch');
const updateMatchData = require('../helpers/match/updateMatchData');

const log = () => {
  console.log(
    `[PANDASCORE] UPDATING SCHEDULED MATCHES. AUTOMATIC_RESCHEDULING[${
      pandaAPI.automaticMatchRescheduling
    }], AUTOMATIC_FINALIZING[${pandaAPI.automaticMatchFinalizing}]`
  );
};

updateScheduledMatches = async () => {
  log();
  let matchesDb = await Match.find({ state: 'scheduled' }).exec();

  if (matchesDb.length !== 0) {
    const matchesIds = matchesDb.map(match => match.pandaID);

    const api_link = `https://api.pandascore.co/csgo/matches?token=${
      keys.panda_score_api_key
    }&filter[id]=${matchesIds}`;

    const response = await axios(api_link);
    const matchesInApi = response.data;

    for (matchInApi of matchesInApi) {
      let dbCounterpart = await Match.findOne({
        pandaID: matchInApi.id
      }).exec();

      await updateMatchData(dbCounterpart._id);
      if (pandaAPI.automaticMatchRescheduling === true) {
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

      if (pandaAPI.automaticMatchFinalizing === true) {
        if (matchInApi.status === 'finished') {
          switch (matchInApi.draw) {
            case false: {
              const winningTeam = await Team.findOne({
                pandaID: matchInApi.winner.id
              })
                .lean()
                .exec();
              finalizeMatch(dbCounterpart, winningTeam);
              break;
            }
            case true: {
              finalizeMatch(dbCounterpart, null);
            }
          }
        }
      }
    }
  }

  setTimeout(updateScheduledMatches, 1000 * 60 * 5);
};

updateScheduledMatches();
