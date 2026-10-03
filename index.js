import hive from "@hiveio/hive-js";


function claim(username, wif) {
  return new Promise((resolve, reject) => {
    hive.api.getAccounts([username], function (err, result) {
      if (err) {
        console.error("getAccounts ERR:", err);
        return reject(err);
      }
      
      if (!result || result.length === 0) {
        console.error(`Account ${username} not found.`);
        return reject(new Error("Account not found"));
      }

      const {
        reward_hbd_balance,
        reward_hive_balance,
        reward_vesting_balance,
      } = result[0];

      if (
        parseFloat(reward_hbd_balance) > 0 ||
        parseFloat(reward_hive_balance) > 0 ||
        parseFloat(reward_vesting_balance) > 0
      ) {
        hive.broadcast.claimRewardBalance(
          wif,
          username,
          reward_hive_balance,
          reward_hbd_balance,
          reward_vesting_balance,
          function (err, data) {
            if (err) {
              console.error("Claim ERR:", err);
              reject(err);
            } else {
              console.log(`Claimed: ${reward_hbd_balance} / ${reward_hive_balance} / ${reward_vesting_balance}`);
              resolve(data);
            }
          }
        );
      } else {
        console.log("Nothing to claim.");
        resolve("Nothing to claim.");
      }
    });
  });
}

async function run() {
  const username = "aafeng";
  const wif = process.env.AAFENG_HIVE_POSTING_KEY;

  if (!wif) {
    console.error("AAFENG_HIVE_POSTING_KEY environment variable is missing.");
    process.exitCode = 1;
    return;
  }

  try {
    await claim(username, wif);
  } catch (err) {
    console.error("Failed to claim rewards:", err);
    process.exitCode = 1;
  }
}

run();