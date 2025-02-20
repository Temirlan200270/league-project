'use strict';

import { NEWS_CATEGORIES } from './data/constants.js'; // Импортируем

// Функции для работы с новостями
const newsUtils = {
    // Создание карточки новости (изменена категория)
    createNewsCard(news) {
        return `
            <article class="news-card">
                <div class="news-image-container">
                    <img src="${news.imageUrl}"
                         alt="${news.title}"
                         class="news-image"
                         loading="lazy">
                </div>
                <div class="news-content">
                    <span class="news-category">${NEWS_CATEGORIES[news.category] || news.category}</span>
                    <h2 class="news-title">${news.title}</h2>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <div class="news-footer">
                        <span class="news-date">${news.date}</span>
                        <a href="${news.link}" class="news-link">Подробнее</a>
                    </div>
                </div>
            </article>
        `;
    },

    // Отображение новостей (без изменений)
    displayNews(news, limit = null) {
        const newsContainer = document.querySelector('.news-grid');
        if (!newsContainer) {
            console.error('Контейнер для новостей не найден');
            return;
        }

        const newsToDisplay = limit ? news.slice(0, limit) : news;
        newsContainer.innerHTML = newsToDisplay.map(item => this.createNewsCard(item)).join('');
    }
};

// Экспорт
export default newsUtils;