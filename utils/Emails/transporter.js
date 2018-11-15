const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true,
  auth: {
    user: 'noresponse@ethlounge.com',
    pass: '*7T_vk,"~"V(Ra5t'
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
