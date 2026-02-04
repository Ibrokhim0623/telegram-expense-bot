const db = require("../db");

function saveExpense(telegramId, expense) {
  return new Promise((resolve, reject) => {
    const { amount, category, note } = expense;

    const query = `
      INSERT INTO expenses (telegram_id, amount, category, note)
      VALUES (?, ?, ?, ?)
    `;

    db.run(query, [telegramId, amount, category, note], function (err) {
      if (err) {
        return reject(err);
      }

      resolve({
        id: this.lastID,
        telegramId,
        amount,
        category,
        note,
      });
    });
  });
}

function getTodayExpenses(telegramId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *
      FROM expenses
      WHERE telegram_id = ?
        AND DATE(created_at) = DATE('now', 'localtime')
      ORDER BY created_at DESC
    `;

    db.all(query, [telegramId], (err, rows) => {
      if (err) {
        return reject(err);
      }

      resolve(rows);
    });
  });
}

function getWeekExpenses(telegramId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *
      FROM expenses
      WHERE telegram_id = ?
        AND created_at >= DATETIME('now', '-6 days', 'localtime')
      ORDER BY created_at DESC
    `;

    db.all(query, [telegramId], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function getTodayCategoryBreakdown(telegramId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT category, SUM(amount) as total
      FROM expenses
      WHERE telegram_id = ?
        AND DATE(created_at) = DATE('now', 'localtime')
      GROUP BY category
      ORDER BY total DESC
    `;

    db.all(query, [telegramId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getWeekCategoryBreakdown(telegramId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT category, SUM(amount) as total
      FROM expenses
      WHERE telegram_id = ?
        AND created_at >= DATETIME('now', '-6 days', 'localtime')
      GROUP BY category
      ORDER BY total DESC
    `;

    db.all(query, [telegramId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getMonthDailyCategoryBreakdown(telegramId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        DATE(created_at) as day,
        category,
        SUM(amount) as total
      FROM expenses
      WHERE telegram_id = ?
        AND strftime('%Y-%m', created_at, 'localtime') =
            strftime('%Y-%m', 'now', 'localtime')
      GROUP BY day, category
      ORDER BY day ASC, total DESC
    `;

    db.all(query, [telegramId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// -------------------- NEW FUNCTION --------------------
// Barcha foydalanuvchilarni olish (cron job uchun)
function getAllUsers() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT telegram_id as telegramId
      FROM expenses
    `;

    db.all(query, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows); // [{ telegramId: 12345 }, { telegramId: 67890 }]
    });
  });
}

// -------------------- EXPORT --------------------
module.exports = {
  saveExpense,
  getTodayExpenses,
  getWeekExpenses,
  getTodayCategoryBreakdown,
  getWeekCategoryBreakdown,
  getMonthDailyCategoryBreakdown,
  getAllUsers,
};
