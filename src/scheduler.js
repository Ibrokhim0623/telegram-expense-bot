const cron = require("node-cron");
const {
  getAllUsers,
  getTodayCategoryBreakdown,
} = require("./services/expenseService");
const formatCategoryBreakdown = require("./utils/formatCategoryBreakdown");

// Max limit example (so‘mda)
const CATEGORY_LIMITS = {
  Ovqat: 50000,
  Taksi: 20000,
  Boshqa: 10000,
};

/**
 * Start daily reminder
 * @param {TelegramBot} bot - telegram bot instance
 */
function startDailyReminder(bot) {
  // TEST uchun 18:15 ga sozlab qo‘yiladi
  cron.schedule("41 17 * * *", async () => {
    console.log("📬 Daily reminder ishlayapti");

    try {
      const users = await getAllUsers();
      if (!users.length) return console.log("🚫 Hali foydalanuvchi yo‘q");

      for (const user of users) {
        const telegramId = user.telegramId;

        // Bugungi category breakdown
        const data = await getTodayCategoryBreakdown(telegramId);

        if (!data.length) {
          bot.sendMessage(telegramId, "📊 Bugungi xarajatlar hali yo‘q");
          continue;
        }

        // --- Limit alert ---
        const limitAlerts = data
          .filter(
            (c) =>
              CATEGORY_LIMITS[c.category] &&
              c.total > CATEGORY_LIMITS[c.category],
          )
          .map(
            (c) =>
              `⚠️ ${c.category} limit oshdi: ${c.total.toLocaleString()} so‘m (limit: ${CATEGORY_LIMITS[c.category].toLocaleString()})`,
          );

        // --- Insight xabari ---
        // Eng katta xarajat category
        const sorted = [...data].sort((a, b) => b.total - a.total);
        const topCategory = sorted[0];
        const totalSum = data.reduce((acc, c) => acc + c.total, 0);

        let message = `📊 Bugungi xarajatlaringiz:\n\n${formatCategoryBreakdown(data)}\n💰 Jami: ${totalSum.toLocaleString()} so‘m\n\n🔹 Eng katta category: ${topCategory.category} — ${topCategory.total.toLocaleString()} so‘m`;

        // Agar limit oshgan bo‘lsa, qo‘shib chiqaramiz
        if (limitAlerts.length) {
          message += `\n\n${limitAlerts.join("\n")}`;
        }

        bot.sendMessage(telegramId, message);
      }
    } catch (err) {
      console.error("Daily reminder error:", err);
    }
  });
}

module.exports = { startDailyReminder };
