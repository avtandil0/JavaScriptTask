const { calculateCommission, getConfigurationFromApi } = require("./src/calculateCommission");
const fs = require("fs");

const input = JSON.parse(fs.readFileSync("input.json"));

async function main() {
  //call api for coefficients
  await getConfigurationFromApi();
  for (let i = 0; i < input.length; i++) {
    let fee = calculateCommission(input[i]);
    console.log(fee.toFixed(2));
  }
}

main();
