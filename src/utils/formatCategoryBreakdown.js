function formatCategoryBreakdown(rows) {
  if (!rows.length) {
    return "Hech qanday xarajat yo‘q 🤷‍♂️";
  }

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  const lines = rows.map((row) => {
    const percent = ((row.total / grandTotal) * 100).toFixed(0);
    return `• ${row.category} — ${row.total.toLocaleString()} so‘m (${percent}%)`;
  });

  return lines.join("\n") + `\n\n💰 Jami: ${grandTotal.toLocaleString()} so‘m`;
}

module.exports = formatCategoryBreakdown;
