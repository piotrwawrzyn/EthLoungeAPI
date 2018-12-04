const { MATCHES_PER_PAGE } = require('../../config/constants');

const sortMatches = (matches, page) => {
  const now = new Date();

  const live = matches
    .filter(match => match.startTime < now && match.state === 'scheduled')
    .reverse();

  const future = matches.filter(match => match.startTime >= now).reverse();

  const past = matches.filter(
    match => match.startTime < now && match.state !== 'scheduled'
  );

  matches = [...live, ...future, ...past];

  const sliceStart = (page - 1) * MATCHES_PER_PAGE;
  const sliceEnd = page * MATCHES_PER_PAGE;

  matches = matches.slice(sliceStart, sliceEnd);

  return matches;
};

module.exports = sortMatches;
