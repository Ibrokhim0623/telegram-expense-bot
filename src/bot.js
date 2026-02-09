const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const {
  saveExpense,
  getTodayCategoryBreakdown,
  getWeekCategoryBreakdown,
  getMonthDailyCategoryBreakdown,
} = require("./services/expenseService");

const {
  getUserByTelegramId,
  createUser,
  finishOnboarding,
} = require("./services/userService");

const { parseExpenseMessage } = require("./utils/parseExpenseMessage");
const formatCategoryBreakdown = require("./utils/formatCategoryBreakdown");
const formatMonthReport = require("./utils/formatMonthReport");
const { startDailyReminder } = require("./scheduler");

const {
  getUserProfile,
  getTotalExpenses,
  getTopCategory,
} = require("./services/profileService");

const formatProfile = require("./utils/formatProfile");

// -------------------- USER SERVICE --------------------

const db = require("./db");

function updateFirstName(telegramId, first_name) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET first_name = ? WHERE telegram_id = ?",
      [first_name, telegramId],
      function (err) {
        if (err) return reject(err);
        resolve();
      },
    );
  });
}

function updateOnboardingStep(telegramId, step) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET onboarding_step = ? WHERE telegram_id = ?",
      [step, telegramId],
      function (err) {
        if (err) return reject(err);
        resolve();
      },
    );
  });
}

function sendBotInfo(bot, chatId, firstName) {
  bot.sendMessage(
    chatId,
    `Salom${firstName ? `, ${firstName}` : ""}! 👋

💰 Xarajatni shunchaki yozing:
• taksi 5000
• non 3000
• kofe 15k

📊 Buyruqlar:
• /today — bugungi xarajatlar
• /week — oxirgi 7 kun
• /month — oylik hisobot

Bot avtomatik kategoriya aniqlaydi 🙂`,
  );
}

// -------------------- BOT INIT --------------------
const TOKEN =
  process.env.BOT_TOKEN || "8324001776:AAFSGXeYxg_zvRVDjDKaGWxZEinK3yLl7-8";

const bot = new TelegramBot(TOKEN, { polling: true });

startDailyReminder(bot);

console.log("🤖 Bot ishga tushdi");

// -------------------- USER STATE --------------------
const userState = {};

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = String(msg.from.id);
  const firstName = msg.from.first_name || null;

  try {
    let user = await getUserByTelegramId(telegramId);

    if (!user) {
      await createUser({ telegramId, firstName });

      return bot.sendMessage(
        chatId,
        `Salom${firstName ? `, ${firstName}` : ""}! 👋

Men xarajatlaringni kunlik, haftalik va oylik kesimda
kuzatishga yordam beraman 📊

Boshlash uchun istalgan xarajatni yozing:
masalan: taksi 5000`,
      );
    }

    if (user.onboarding_step === "done") {
      return sendBotInfo(bot, chatId, user.first_name);
    }

    await finishOnboarding(telegramId);
    sendBotInfo(bot, chatId, user.first_name);
  } catch (err) {
    console.error("/start onboarding error:", err);
    bot.sendMessage(chatId, "⚠️ Xatolik yuz berdi");
  }
});

bot.onText(/\/today/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = String(msg.from.id);

  try {
    const data = await getTodayCategoryBreakdown(telegramId);

    if (!data.length) {
      return bot.sendMessage(chatId, "📭 Bugun hali xarajat yo‘q");
    }

    bot.sendMessage(
      chatId,
      `📊 Bugungi xarajatlar:\n\n${formatCategoryBreakdown(data)}`,
    );
  } catch (err) {
    console.error("/today error:", err);
    bot.sendMessage(chatId, "⚠️ Xatolik yuz berdi");
  }
});

bot.onText(/\/week/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = String(msg.from.id);

  try {
    const data = await getWeekCategoryBreakdown(telegramId);

    if (!data.length) {
      return bot.sendMessage(chatId, "📭 Oxirgi 7 kunda xarajat yo‘q");
    }

    bot.sendMessage(
      chatId,
      `📊 Oxirgi 7 kun:\n\n${formatCategoryBreakdown(data)}`,
    );
  } catch (err) {
    console.error("/week error:", err);
    bot.sendMessage(chatId, "⚠️ Xatolik yuz berdi");
  }
});

bot.onText(/\/month/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = String(msg.from.id);

  try {
    const rows = await getMonthDailyCategoryBreakdown(telegramId);
    const message = formatMonthReport(rows);

    bot.sendMessage(chatId, message);
  } catch (err) {
    console.error("/month error:", err);
    bot.sendMessage(chatId, "⚠️ Oylik hisobotni olishda xatolik");
  }
});

bot.onText(/\/profile/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = String(msg.from.id);

  try {
    const user = await getUserProfile(telegramId);

    if (!user) {
      return bot.sendMessage(
        chatId,
        "Profil topilmadi. /start bosib qayta boshlang.",
      );
    }

    const total = await getTotalExpenses(telegramId);
    const topCategory = await getTopCategory(telegramId);

    const message = formatProfile({ user, total, topCategory });

    bot.sendMessage(chatId, message);
  } catch (err) {
    console.error("/profile error:", err);
    bot.sendMessage(chatId, "⚠️ Profilni olishda xatolik");
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = String(msg.from.id);
  const text = msg.text;
  const state = userState[telegramId];

  try {
    if (state && state.awaitingName) {
      if (text === "/skip") {
        await updateOnboardingStep(telegramId, "completed");
        bot.sendMessage(
          chatId,
          "✅ Tayyor! Xarajat yozishni boshlashingiz mumkin.",
        );
      } else {
        await updateFirstName(telegramId, text);
        await updateOnboardingStep(telegramId, "completed");
        bot.sendMessage(
          chatId,
          `Rahmat, ${text}! ✅ Xarajat yozishni boshlashingiz mumkin.`,
        );
      }
      delete userState[telegramId];
      return;
    }

    if (!text || text.startsWith("/")) return;

    const parsed = parseExpenseMessage(text);

    if (!parsed) {
      return bot.sendMessage(
        chatId,
        `❌ Tushunmadim\n\nMisollar:\n• taksi 5000\n• non 3000\n• kofe 15k`,
      );
    }

    await saveExpense(telegramId, parsed);

    bot.sendMessage(
      chatId,
      `✅ Saqlandi\n\n📌 ${parsed.category}\n💰 ${parsed.amount.toLocaleString()} so‘m`,
    );
  } catch (err) {
    console.error("Message handler error:", err);
    bot.sendMessage(chatId, "⚠️ Xatolik yuz berdi");
  }
});
