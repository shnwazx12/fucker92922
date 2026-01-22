const { Telegraf } = require("telegraf");
const express = require("express");
const { BOT_TOKEN, PORT } = require("./config");
const { connectDB, getDB } = require("./database");

if (!BOT_TOKEN) {
  console.log("❌ BOT_TOKEN missing in .env");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.get("/", (req, res) => res.send("✅ Channel Editor Bot is Running"));

function formatDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString("en-IN");
  const time = now.toLocaleTimeString("en-IN");
  const year = now.getFullYear();
  return { date, time, year };
}

bot.start(async (ctx) => {
  ctx.reply(
    `🔥 Channel Editor Bot Online!\n\n✅ Add me to your channel & make me ADMIN.\n\nCommands:\n/setfooter <text>\n/viewfooter\n/disablefooter`
  );
});

bot.command("setfooter", async (ctx) => {
  const footerText = ctx.message.text.split(" ").slice(1).join(" ");
  if (!footerText) return ctx.reply("❌ Use: /setfooter Your Footer Text");

  const db = getDB();
  await db.collection("settings").updateOne(
    { userId: ctx.from.id },
    { $set: { footer: footerText, enabled: true } },
    { upsert: true }
  );

  ctx.reply(`✅ Footer Saved:\n${footerText}`);
});

bot.command("viewfooter", async (ctx) => {
  const db = getDB();
  const data = await db.collection("settings").findOne({ userId: ctx.from.id });

  if (!data || !data.footer) return ctx.reply("❌ No footer set yet.");
  ctx.reply(`📌 Your Footer:\n${data.footer}`);
});

bot.command("disablefooter", async (ctx) => {
  const db = getDB();
  await db.collection("settings").updateOne(
    { userId: ctx.from.id },
    { $set: { enabled: false } },
    { upsert: true }
  );
  ctx.reply("✅ Footer Disabled.");
});

bot.on("channel_post", async (ctx) => {
  try {
    const post = ctx.channelPost;
    const messageId = post.message_id;
    const chatId = post.chat.id;

    const db = getDB();
    const settings = await db.collection("settings").findOne({ enabled: true });

    const footer = settings?.footer || "© SHNWAZ | Auto Updated";

    const { date, time, year } = formatDateTime();

    if (post.caption !== undefined) {
      const newCaption = `${post.caption}\n\n🕒 ${date} | ${time} | ${year}\n${footer}`;
      await ctx.telegram.editMessageCaption(chatId, messageId, null, newCaption);
    }

    if (post.text !== undefined) {
      const newText = `${post.text}\n\n🕒 ${date} | ${time} | ${year}\n${footer}`;
      await ctx.telegram.editMessageText(chatId, messageId, null, newText);
    }

    console.log("✅ Edited Post:", messageId);
  } catch (err) {
    console.log("❌ Edit Failed:", err.message);
  }
});

(async () => {
  await connectDB();
  bot.launch();
  app.listen(PORT, () => console.log(`🚀 Server Running on Port ${PORT}`));
})();
