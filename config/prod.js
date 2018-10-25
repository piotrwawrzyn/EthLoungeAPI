module.exports = {
  mongoDbURI: process.env.MONGO_DB_URI,
  cookieKey: process.env.COOKIE_KEY,
  initUsername: process.env.DB_USER_LOGIN,
  initPassword: process.env.DB_USER_PASSWORD,
  corsAllow: 'https://ethlounge.herokuapp.com'
};
