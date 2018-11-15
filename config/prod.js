module.exports = {
  mongoDbURI: process.env.MONGO_DB_URI,
  cookieKey: process.env.COOKIE_KEY,
  initUsername: process.env.DB_USER_LOGIN,
  initPassword: process.env.DB_USER_PASSWORD,
  corsAllow: 'https://ethlounge.herokuapp.com',
  frontEndServer: 'https://ethlounge.com',
  panda_score_api_key: process.env.PANDA_SCORE_API_KEY
};
