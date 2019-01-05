const returnBets = require('./returnBets');
const mongoose = require('mongoose');
const Token = mongoose.model('token');
const User = mongoose.model('user');
const Bet = mongoose.model('bet');
const Big = require('big.js');
const _ = require('lodash');
const constants = require('../../config/constants');
const tokenFromWei = require('../../utils/tokenFromWei');

const markBets = async match => {
  let bets = await Bet.find({ matchID: match._id }).exec();

  for (bet of bets) {
    if (bet.teamID === match.winnerID) bet.state = 'won';
    else bet.state = 'lost';

    bet.displayedToUser = false;

    await bet.save();
  }
};

const calculateTotalEthBet = buckets => {
  let totalEthBet = new Big(0);

  for (bucket of buckets) {
    totalEthBet = totalEthBet.plus(bucket.ethValue);
  }

  return totalEthBet;
};

const calculateEthDue = (
  bet,
  totalEthBetLosingTeam,
  totalEthBetWinningTeam,
  allTokens
) => {
  let betEthValue = new Big(0);

  for (token of bet.tokensBet) {
    const { id, amount } = token;
    const { decimals, price } = _.find(allTokens, { _id: id });

    const eth = Big(amount)
      .div(`10e+${decimals - 1}`)
      .times(price.ETH);
    betEthValue = betEthValue.plus(eth);
  }

  const ethDue = betEthValue
    .times(totalEthBetLosingTeam)
    .div(totalEthBetWinningTeam);

  return ethDue;
};

const createBuckets = (bets, allTokens) => {
  let buckets = [];
  for (bet of bets) {
    for (token of bet.tokensBet) {
      const { decimals, price } = _.find(allTokens, { _id: token.id });
      const { id, amount } = token;

      const ethValue = Big(amount)
        .div(`10e+${decimals - 1}`)
        .times(price.ETH);

      const bucket = _.find(buckets, { id });

      if (bucket) {
        bucket.amount = bucket.amount.plus(amount);
        bucket.ethValue = bucket.ethValue.plus(ethValue);
      } else {
        buckets.push({ id: id, amount: new Big(amount), ethValue: ethValue });
      }
    }
  }

  return buckets;
};

const updateTokensWon = (tokensWon, tokenDrawn) => {
  const token = _.find(tokensWon, { id: tokenDrawn.id });
  if (token) {
    token.amount = token.amount.plus(tokenDrawn.amount);
  } else {
    tokensWon.push(tokenDrawn);
  }

  return tokensWon;
};

const saveWinningsToDatabase = async (bet, tokensWon, logs, allTokens) => {
  // Warning: tokensWon contains amount in BigDecimal format

  tokensWon = tokensWon.filter(token => token.amount.cmp(0) > 0);

  const gambler = await User.findById(bet.betMakerID).exec();

  const { balances } = gambler;

  let winningsValue = new Big(0);

  for (token of tokensWon) {
    let { id, amount } = token;

    const tokenInDb = _.find(allTokens, { _id: id });
    const price = tokenInDb.price.USD;
    const decimals = tokenInDb.decimals;

    winningsValue = winningsValue.plus(
      tokenFromWei(amount, decimals).mul(price)
    );

    let userBalance = _.find(balances, { id });

    if (userBalance) {
      userBalance.balance = amount.plus(userBalance.balance).toFixed();
    } else {
      amount = amount.toFixed();
      balances.push({ id, balance: amount });
    }
  }

  bet.tokensWon = tokensWon;
  bet.logs = logs;
  bet.winningsValue = winningsValue.toFixed(3);

  await bet.save();
  gambler.markModified('balances');
  await gambler.save();
};

const cleanTheDust = async buckets => {
  // This method needs further implementation to gather the dust
  await asignBucketsToHouseEdge(buckets);

  for (bucket of buckets) {
    if (bucket.amount.cmp(0) === 1) {
      console.log(
        `[DUST CLEANER] Bucket with coin ${bucket.id.toFixed()} has some dust left. ${
          bucket.ethValue
        } (${bucket.amount.toFixed()})`
      );
    }
  }
};

const cutHouseEdgeFee = async buckets => {
  let bucketsToShare = [];
  let bucketsForFee = [];
  const { HOUSE_EDGE_FEE } = constants;

  for (bucket of buckets) {
    let { id, ethValue, amount } = bucket;

    log(`Asigning house edge. Token ${id}, ~${ethValue} ETH (${amount})`);

    bucketsToShare.push({
      id,
      ethValue: ethValue.mul(1 - HOUSE_EDGE_FEE),
      amount: amount.mul(1 - HOUSE_EDGE_FEE)
    });

    bucketsForFee.push({
      id,
      ethValue: ethValue.mul(HOUSE_EDGE_FEE),
      amount: amount.mul(HOUSE_EDGE_FEE)
    });
  }

  await asignBucketsToHouseEdge(bucketsForFee);

  return bucketsToShare;
};

asignBucketsToHouseEdge = async buckets => {
  const houseEdgeUser = await User.findOne({
    permissions: { $in: ['houseedge'] }
  }).exec();

  // Protection from unwated exceptions
  if (!houseEdgeUser) return;

  buckets = buckets.filter(bucket => bucket.amount.cmp(0) > 0);

  for (bucket of buckets) {
    bucket.amount = bucket.amount.round(0, 0);

    let { id, ethValue, amount } = bucket;

    let userBalance = _.find(houseEdgeUser.balances, { id });

    if (userBalance) {
      userBalance.balance = amount.plus(userBalance.balance).toFixed();
    } else {
      amount = amount.toFixed();
      houseEdgeUser.balances.push({ id, balance: amount });
    }
  }

  await houseEdgeUser.save();
};

const log = message => {
  const log = `[MATCH_DRAWING_ALGORITHM] ${message}`;
  console.log(log);
  return log;
};

const finalizeMatch = async (match, winningTeam) => {
  log(`Finalizing match ${match._id}`);

  if (winningTeam === null) {
    match.state = 'draw';
    await match.save();
    await returnBets(match);
    return;
  }

  if (!winningTeam) return;

  match.state = 'finalized';
  match.winnerID = winningTeam._id;
  await match.save();

  await returnBets(match, winningTeam);
  await markBets(match);

  const allTokens = await Token.find({})
    .lean()
    .exec();

  let bets = await Bet.find({ matchID: match._id }).exec();

  const winningBets = bets.filter(bet => bet.teamID === winningTeam._id);
  const winningBetsBuckets = createBuckets(winningBets, allTokens);
  const totalEthBetWinningTeam = calculateTotalEthBet(winningBetsBuckets);

  const losingBets = bets.filter(bet => bet.teamID !== winningTeam._id);
  let losingBetsBuckets = createBuckets(losingBets, allTokens);
  losingBetsBuckets = await cutHouseEdgeFee(losingBetsBuckets);
  const totalEthBetLosingTeam = calculateTotalEthBet(losingBetsBuckets);

  log(`Total bet losing team: ${totalEthBetLosingTeam.toFixed()}`);
  log(`Total bet winning team: ${totalEthBetWinningTeam.toFixed()}`);

  p: for (bet of winningBets) {
    let logs = [];
    let ethDue = calculateEthDue(
      bet,
      totalEthBetLosingTeam,
      totalEthBetWinningTeam,
      allTokens
    );

    logs.push(
      log(
        `---------- Rewarding user ${
          bet.betMakerID
        } with ${ethDue.toFixed()} ETH ----------`
      )
    );

    let tokensWon = [];

    while (ethDue.cmp(0) === 1) {
      if (losingBetsBuckets.length === 0) {
        //Prevent infinite loop in extreme cases
        logs.push(log('INFINITE LOOP PREVENTION 1 TRIGGERED'));
        break p;
      }

      const randomIndex = Math.floor(Math.random() * losingBetsBuckets.length);
      const bucket = losingBetsBuckets[randomIndex];

      let tokenAmountToSupply;
      let ethValueToSupply;

      // Bucket value <= ethDue ---> Give whole bucket and go on
      if (ethDue.cmp(bucket.ethValue) >= 0) {
        tokenAmountToSupply = bucket.amount.round(0, 0);
        ethValueToSupply = bucket.ethValue;
        logs.push(
          log(
            `Bucket value <= ethDue --> Supplying with ${ethValueToSupply.toFixed()} ETH of token ${
              bucket.id
            } (${bucket.amount})`
          )
        );
      } else {
        // Bucket value > ethDue

        const action = Math.floor(Math.random() * 4);

        switch (action) {
          case 0: {
            // 25% chance to supply rest of the ethDue in one go

            tokenAmountToSupply = ethDue
              .div(bucket.ethValue)
              .mul(bucket.amount)
              .round(0, 0);

            ethValueToSupply = ethDue;
            logs.push(
              log(
                `Bucket value > ethDue --> 1/4 Drawn, Supplying with ${ethValueToSupply.toFixed()} ETH of token ${
                  bucket.id
                } (${tokenAmountToSupply.round(0, 0).toFixed()})`
              )
            );
            break;
          }

          default: {
            // 75% chance to supply RANDOM amount from bucket
            const randomPercent = Math.random();
            ethValueToSupply = ethDue.mul(randomPercent);
            tokenAmountToSupply = ethValueToSupply
              .div(bucket.ethValue)
              .mul(bucket.amount)
              .round(0, 0);

            logs.push(
              log(
                `Bucket value > ethDue: 3/4 Drawn, Supplying with ${ethValueToSupply.toFixed()} ETH of token ${
                  bucket.id
                } (${tokenAmountToSupply})`
              )
            );
            break;
          }
        }
      }

      // Charge the eth value from ethDue and update tokensWon and bucket
      ethDue = ethDue.minus(ethValueToSupply);

      tokensWon = updateTokensWon(tokensWon, {
        id: bucket.id,
        amount: tokenAmountToSupply
      });

      // console.log(tokenAmountToSupply.round(0, 0).toFixed());

      bucket.ethValue = bucket.ethValue.minus(ethValueToSupply);
      bucket.amount = bucket.amount.minus(tokenAmountToSupply);

      // If bucket is empty - remove it
      if (bucket.ethValue.cmp(0) < 1)
        _.remove(losingBetsBuckets, { id: bucket.id });
    }
    logs.push(log(`Finished rewarding user ${bet.betMakerID}`));
    await saveWinningsToDatabase(bet, tokensWon, logs, allTokens);
  }

  await cleanTheDust(losingBetsBuckets);
};

module.exports = finalizeMatch;
