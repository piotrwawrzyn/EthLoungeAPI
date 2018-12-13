const { FEE_MULTIPLIER } = require('../../config/constants');

const CalculateOdds = totalDollarsBet => {
  const sum = +totalDollarsBet[0] + +totalDollarsBet[1];

  const odds = totalDollarsBet.map(total => {
    if (sum === 0) {
      return (2.0 * FEE_MULTIPLIER).toFixed(2);
    } else {
      const percentage = (total / sum) * 100;

      switch (percentage) {
        case 100: {
          return 1 * FEE_MULTIPLIER;
        }

        case 0: {
          return 100 * FEE_MULTIPLIER;
        }

        default: {
          return ((1 / (percentage / 100)) * FEE_MULTIPLIER).toFixed(2);
        }
      }
    }
  });

  return odds;
};

module.exports = CalculateOdds;
