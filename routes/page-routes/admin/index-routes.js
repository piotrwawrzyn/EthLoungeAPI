const dynamicConfig = require('../../../config/dynamicConfig');

module.exports = server => {
  server.get('/api/admin/index_info', (req, res) => {
    const { pandaAPI } = dynamicConfig;

    res.send({ pandaAPI });
  });

  server.post(
    '/backend/update-config/pandascoreapi/automatic-match-rescheduling',
    (req, res) => {
      const { newValue } = req.body.data;

      dynamicConfig.pandaAPI.automaticMatchRescheduling = newValue;

      res.send();
    }
  );

  server.post(
    '/backend/update-config/pandascoreapi/automatic-match-finalizing',
    (req, res) => {
      const { newValue } = req.body.data;

      dynamicConfig.pandaAPI.automaticMatchFinalizing = newValue;

      res.send();
    }
  );
};
