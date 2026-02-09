const db = require("../db");

function getUserByTelegramId(telegramId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM users WHERE telegram_id = ?`,
      [telegramId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      },
    );
  });
}

function createUser({ telegramId, firstName }) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO users (telegram_id, first_name, onboarding_step)
      VALUES (?, ?, 'intro')
      `,
      [telegramId, firstName],
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
}

function finishOnboarding(telegramId) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE users
      SET onboarding_step = 'done'
      WHERE telegram_id = ?
      `,
      [telegramId],
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
}

module.exports = {
  getUserByTelegramId,
  createUser,
  finishOnboarding,
};
