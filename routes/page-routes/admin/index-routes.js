const dynamicConfig = require('../../../config/dynamicConfig');

module.exports = server => {
  server.get('/api/admin/index_info', (req, res) => {
    const { pandaAPI } = dynamicConfig;

    res.send({ pandaAPI });
  });

  server.post(
    '/backend/update-config/pandascoreapi/automatic-game-rescheduling',
    (req, res) => {
      const { newValue } = req.body.data;

      dynamicConfig.pandaAPI.automaticGameRescheduling = newValue;

      res.send();
    }
  );

  server.post(
    '/backend/update-config/pandascoreapi/automatic-game-finalizing',
    (req, res) => {
      const { newValue } = req.body.data;

      dynamicConfig.pandaAPI.automaticGameFinalizing = newValue;

      res.send();
    }
  );
};
