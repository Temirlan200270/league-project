'use strict';

// Категории ролей чемпионов
const roleCategories = {
    "Assassin": "Убийца",
    "Fighter": "Воин",
    "Mage": "Маг",
    "Marksman": "Стрелок",
    "Support": "Поддержка",
    "Tank": "Танк"
};

// Уровни сложности теперь числовые
const difficultyLevels = {
    1: "Низкая",
    2: "Средняя",
    3: "Высокая"
};

const NEWS_CATEGORIES = {
    updates: "Обновления",
    events: "События",
    esports: "Киберспорт"
};

// Экспорт констант (если используются модули)
export { roleCategories, difficultyLevels, NEWS_CATEGORIES };