const mongoose = require('mongoose');
const Gambler = mongoose.model('gambler');
const cookieSession = require('cookie-session');

module.exports = server => {
  server.post('/login', (req, res) => {
    const address = req.body.address;
    Gambler.findOne({ address: address }, (err, gambler) => {
      if (err) {
        res.send(err);
        return;
      }

      let gamblerToSend;

      if (!gambler) {
        const newGambler = new Gambler({ address: address });
        newGambler.save();
        gamblerToSend = newGambler;
      } else {
        gamblerToSend = gambler;
      }

      req.session.current_gambler = {
        id: gamblerToSend.id,
        address: gamblerToSend.address
      };
      res.send(gamblerToSend);
    });
  });

  server.get('/api/current_gambler', (req, res) => {
    res.send(req.session.current_gambler);
  });

  server.get('/logout', (req, res) => {
    req.session.current_gambler = null;
    res.end(null);
  });
};
