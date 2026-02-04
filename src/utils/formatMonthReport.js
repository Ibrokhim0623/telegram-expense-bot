function formatMonthReport(rows) {
  if (!rows.length) return "📭 Bu oyda xarajat yo‘q";

  const daysMap = {};
  let monthTotal = 0;

  // data structure
  for (const row of rows) {
    if (!daysMap[row.day]) {
      daysMap[row.day] = {
        categories: [],
        total: 0,
      };
    }

    daysMap[row.day].categories.push({
      category: row.category,
      total: row.total,
    });

    daysMap[row.day].total += row.total;
    monthTotal += row.total;
  }

  let message = `📅 Oylik tahlil\n\n`;

  for (const [day, data] of Object.entries(daysMap)) {
    message += `📆 ${day}\n`;

    for (const item of data.categories) {
      const percent = Math.round((item.total / data.total) * 100);
      message += `• ${item.category} — ${item.total.toLocaleString()} so‘m (${percent}%)\n`;
    }

    message += `💰 Jami: ${data.total.toLocaleString()} so‘m\n\n`;
  }

  message += `────────────────\n`;
  message += `💸 Oy bo‘yicha jami: ${monthTotal.toLocaleString()} so‘m`;

  return message;
}

module.exports = formatMonthReport;
