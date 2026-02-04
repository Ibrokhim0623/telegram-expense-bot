const db = require("./index");

function runMigrations() {
  db.serialize(() => {
    // Foreign keylarni yoqish
    db.run(`PRAGMA foreign_keys = ON;`);

    // -------------------- USERS TABLE --------------------
    // Agar jadval mavjud bo'lsa, faqat kerakli kolonkalarni qo'shamiz
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        telegram_id TEXT PRIMARY KEY,
        onboarding_step TEXT DEFAULT 'intro',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      (err) => {
        if (err) console.error("Users table creation error:", err);
      },
    );

    // first_name kolonkasi yo'q bo'lsa, qo'shish
    db.run(`ALTER TABLE users ADD COLUMN first_name TEXT;`, (err) => {
      if (err) {
        // Agar duplicate column xatosi bo'lsa, e'tiborsiz qoldiramiz
        if (!err.message.includes("duplicate column name")) {
          console.error("Adding first_name column error:", err);
        }
      }
    });

    // -------------------- EXPENSES TABLE --------------------
    db.run(
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        category TEXT NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (telegram_id) REFERENCES users(telegram_id)
          ON DELETE CASCADE
      );`,
      (err) => {
        if (err) console.error("Expenses table creation error:", err);
      },
    );

    console.log("✅ Migrations bajarildi");
  });
}

module.exports = runMigrations;
