const osUtils = require('os-utils');

module.exports = () => {
  const platform = osUtils.platform();
  const numberOfCpus = osUtils.cpuCount();
  const loadAvg5 = osUtils.loadavg(5);
  const totalMemory = osUtils.totalmem();
  const freeMemory = osUtils.freemem();
  const freeMemoryPercentage = osUtils.freememPercentage();
  const processUptime = osUtils.processUptime();

  const stats = {
    platform,
    numberOfCpus,
    loadAvg5,
    totalMemory,
    freeMemory,
    freeMemoryPercentage,
    processUptime
  };

  return stats;
};
