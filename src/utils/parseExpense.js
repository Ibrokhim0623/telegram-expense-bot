function parseExpense(text) {
  if (!text) return null;

  const parts = text.trim().split(/\s+/);

  let amount = null;
  let category = null;
  let note = null;

  for (const part of parts) {
    // faqat raqam bo‘lsa
    if (/^\d+$/.test(part)) {
      amount = Number(part);
    } else if (/^\d+k$/i.test(part)) {
      amount = Number(part.slice(0, -1)) * 1000;
    } else {
      category = category ? category + " " + part : part;
    }
  }

  if (!amount || !category) {
    return null;
  }

  return {
    amount,
    category,
    note,
  };
}

module.exports = parseExpense;
