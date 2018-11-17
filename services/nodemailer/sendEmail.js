const transporter = require('./transporter');

const sendEmail = (
  to,
  subject,
  content,
  from = '"ethlounge" <noreply@ethlounge.com>'
) => {
  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    html: content
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });
};

module.exports = sendEmail;
