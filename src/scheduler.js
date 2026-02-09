const cron = require("node-cron");
const {
  getAllUsers,
  getTodayCategoryBreakdown,
} = require("./services/expenseService");
const formatCategoryBreakdown = require("./utils/formatCategoryBreakdown");

/**
 * Start daily reminder
 * @param {TelegramBot} bot
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

        const data = await getTodayCategoryBreakdown(telegramId);

        if (!data.length) {
          bot.sendMessage(telegramId, "📊 Bugungi xarajatlar hali yo‘q");
          continue;
        }

        const sorted = [...data].sort((a, b) => b.total - a.total);
        const topCategory = sorted[0];

        let message = `📊 Bugungi xarajatlaringiz:\n\n${formatCategoryBreakdown(data)}\n🔹 Eng katta category: ${topCategory.category} — ${topCategory.total.toLocaleString()} so‘m`;

        bot.sendMessage(telegramId, message);
      }
    } catch (err) {
      console.error("Daily reminder error:", err);
    }
  });
}

module.exports = { startDailyReminder };
