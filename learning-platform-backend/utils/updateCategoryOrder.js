const Theory = require("../models/Theory");
const CategoryOrder = require("../models/CategoryOrder");

const updateCategoryOrder = async () => {
  try {
    // Получаем все теории, отсортированные по order
    const theories = await Theory.find().sort({ order: 1 });

    // Формируем список уникальных категорий по порядку
    const orderedCategories = [];
    for (const theory of theories) {
      if (!orderedCategories.includes(theory.category)) {
        orderedCategories.push(theory.category);
      }
    }

    // Обновляем settings
    await CategoryOrder.findOneAndUpdate(
      { key: "categoryOrder" },
      { value: orderedCategories },
      { upsert: true }
    );

    console.log("✅ categoryOrder обновлён автоматически:", orderedCategories);
  } catch (err) {
    console.error("❌ Ошибка при обновлении categoryOrder:", err);
  }
};

module.exports = updateCategoryOrder;
