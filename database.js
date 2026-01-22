const { MongoClient } = require("mongodb");
const { MONGO_URI } = require("./config");

let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db("channel_editor_bot");
  console.log("✅ MongoDB Connected");
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };
