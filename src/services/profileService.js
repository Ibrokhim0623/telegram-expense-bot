const db = require("../db");

// User info
function getUserProfile(telegramId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        first_name,
        created_at
      FROM users
      WHERE telegram_id = ?
      `,
      [telegramId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      },
    );
  });
}

// Total expenses
function getTotalExpenses(telegramId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        SUM(amount) as total
      FROM expenses
      WHERE telegram_id = ?
      `,
      [telegramId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row?.total || 0);
      },
    );
  });
}

// Top category
function getTopCategory(telegramId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        category,
        SUM(amount) as total
      FROM expenses
      WHERE telegram_id = ?
      GROUP BY category
      ORDER BY total DESC
      LIMIT 1
      `,
      [telegramId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      },
    );
  });
}

module.exports = {
  getUserProfile,
  getTotalExpenses,
  getTopCategory,
};
