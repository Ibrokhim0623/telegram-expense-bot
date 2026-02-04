const { parseAmount } = require("./amountParser");
const { detectCategory } = require("./categoryDetector");

function parseExpenseMessage(text) {
  const amount = parseAmount(text);
  if (!amount) return null;

  const category = detectCategory(text);

  return {
    amount,
    category,
    note: text,
  };
}

module.exports = { parseExpenseMessage };
