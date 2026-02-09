const CATEGORY_KEYWORDS = {
  "Yo‘l haqi": [
    "taksi",
    "taxi",
    "yo‘l kira",
    "yolkira",
    "metro",
    "avtobus",
    "uber",
    "yandex",
    "yo'lkira",
  ],
  Yegulik: [
    "ovqat",
    "non",
    "shirin",
    "shirinlik",
    "kofe",
    "qahva",
    "choy",
    "ichimlik",
    "burger",
    "pizza",
  ],
  "Ro'zg'orlik": [
    "kartoshka",
    "piyoz",
    "sabzi",
    "shalg'om",
    "un",
    "moy",
    "yog'",
    "sut",
    "qatiq",
    "kefir",
    "bozorlik",
  ],
  Sport: ["futbol", "tennis", "billiard"],
  "Kommunal to'lovlar": ["svet", "gaz", "sovuq suv", "elektr", "tok"],
};

function detectCategory(text) {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      return category;
    }
  }

  return "Boshqa";
}

module.exports = { detectCategory };
