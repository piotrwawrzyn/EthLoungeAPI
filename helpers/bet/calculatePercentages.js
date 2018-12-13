const CalculatePercentages = totalDollarsBet => {
  const sum = +totalDollarsBet[0] + +totalDollarsBet[1];

  const percentages = totalDollarsBet.map(total => {
    if (sum === 0) return 50;

    return Math.round((total / sum) * 100);
  });

  return percentages;
};

module.exports = CalculatePercentages;
