function formatExpenses(expenses) {
  if (!expenses.length) {
    return "Hech qanday xarajat yo‘q 🤷‍♂️";
  }

  let total = 0;

  const lines = expenses.map((e) => {
    total += e.amount;
    return `• ${e.category} — ${e.amount.toLocaleString()} so‘m`;
  });

  return lines.join("\n") + `\n\n💰 Jami: ${total.toLocaleString()} so‘m`;
}

module.exports = formatExpenses;
