require("dotenv").config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT || 10000
};
