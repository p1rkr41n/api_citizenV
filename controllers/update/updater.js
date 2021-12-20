// data will update once a day at 23:59:00
const cron = require("node-cron");
const updateAddresses = require("./updateAddresses");
const updateStaticalInfo = require("./updateStaticalInfo");
cron.schedule("59 23 * * *", function () {
  console.log("/controllers/update/updater.js run");
  updateAddresses();
  updateStaticalInfo();
});
