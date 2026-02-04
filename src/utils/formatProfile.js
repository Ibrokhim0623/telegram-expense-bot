function formatProfile({ user, total, topCategory }) {
  const joinedDate = new Date(user.created_at).toLocaleDateString("uz-UZ");

  return `
👤 Profil

Ism: ${user.first_name || "—"}
Botdan foydalangan sana: ${joinedDate}
Jami xarajatlar: ${total.toLocaleString()} so‘m
Eng ko‘p xarajat: ${
    topCategory
      ? `${topCategory.category} (${topCategory.total.toLocaleString()} so‘m)`
      : "—"
  }

📊 Buyruqlar:
• /today
• /week
• /month
`;
}

module.exports = formatProfile;
