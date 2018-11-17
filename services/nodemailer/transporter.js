const nodemailer = require('nodemailer');
const keys = require('../../config/keys');

const transporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true,
  auth: {
    user: keys.emailNoResponseLogin,
    pass: keys.emailNoResponsePassword
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
