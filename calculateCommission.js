const axios = require("axios");

let cashInFeeMax;
let naturalPersonCashOutInFee;
let naturalPersonCashOutFreeAmount;
let naturalPersonCashOutFee;
let juridicalPersonCashOutFee;
let juridicalPersonCashOutFeeMin;

async function getConfigurationFromApi() {
  let result = await axios.all([
    axios.get("https://developers.paysera.com/tasks/api/cash-in"),
    axios.get("https://developers.paysera.com/tasks/api/cash-out-natural"),
    axios.get(" https://developers.paysera.com/tasks/api/cash-out-juridical"),
  ]);

  naturalPersonCashOutInFee = result[0].data.percents;
  cashInFeeMax = result[0].data.max.amount;

  naturalPersonCashOutFreeAmount = result[1].data.week_limit.amount;
  naturalPersonCashOutFee = result[1].data.percents / 100;

  juridicalPersonCashOutFee = result[2].data.percents / 100;
  juridicalPersonCashOutFeeMin = result[2].data.min.amount;
}

// Helper function to find  differences in days
function dateDiffInDays(a, b) {
  const msPerDay = 86400000; // Number of milliseconds in a day

  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  const diff = utc2 - utc1;

  return Math.floor(diff / msPerDay);
}

// Helper function to round to the smallest currency item
function roundUp(num, precision) {
  precision = Math.pow(10, precision);
  return Math.ceil(num * precision) / precision;
}

//users list for check if user has cashOut in this week
let users = {};

function calculateCommission(input) {
  const operation = input.operation;
  const userId = input.user_id;
  const userType = input.user_type;
  const operationType = input.type;
  const date = input.date;

  let commissionFee = 0;

  // Calculate commission fee for cash in
  if (operationType === "cash_in") {
    const fee = (operation.amount * naturalPersonCashOutInFee) / 100;
    commissionFee = fee > cashInFeeMax ? cashInFeeMax : fee;
  }

  // Calculate commission fee for cash out
  if (operationType === "cash_out") {
    //find if user has cashOut in this week
    let user = users[userId] || { cashOutThisWeek: 0, date: date };
    let cashOutAmount = operation.amount;

    const diffInDays = dateDiffInDays(new Date(user.date), new Date(date));
    //if last cashOut day is far more than a week, reset
    if (diffInDays > 7) {
      user = { cashOutThisWeek: 0, date: date };
    }

    if (userType === "natural") {
      const totalCashOutThisWeek = user.cashOutThisWeek + cashOutAmount;

      if (totalCashOutThisWeek <= naturalPersonCashOutFreeAmount) {
        commissionFee = 0;
      } else {
        /**
        if cashOutThisWeek is more then naturalPersonCashOutFreeAmount,
         commissionFee should be calculated from cashOutAmount, else - from difference beatween cashOutAmount & naturalPersonCashOutFreeAmountResult
         */

        const naturalPersonCashOutFreeAmountResult =
          user.cashOutThisWeek >= naturalPersonCashOutFreeAmount
            ? 0
            : naturalPersonCashOutFreeAmount;

        //commission is calculated only from exceeded amount
        commissionFee =
          (cashOutAmount - naturalPersonCashOutFreeAmountResult) *
          naturalPersonCashOutFee;
      }
      user.cashOutThisWeek = totalCashOutThisWeek;
      users[userId] = { ...user };
    }

    // Calculate commission fee for juridical persons
    if (userType === "juridical") {
      commissionFee = cashOutAmount * juridicalPersonCashOutFee;
      commissionFee =
        commissionFee < juridicalPersonCashOutFeeMin
          ? juridicalPersonCashOutFeeMin
          : commissionFee;
    }
  }

  // Round commission fee to smallest currency item
  commissionFee = roundUp(commissionFee, 2);

  return commissionFee;
}

module.exports = { calculateCommission, getConfigurationFromApi };
