function parseAmount(text) {
  const normalized = text
    .toLowerCase()
    .replace(/ming/g, "000")
    .replace(/k/g, "000")
    .replace(/[^\d]/g, "");

  const amount = Number(normalized);
  return amount > 0 ? amount : null;
}

module.exports = { parseAmount };
