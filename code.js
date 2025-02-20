import newsUtils from './news-utils.js';
import { db } from './firebase-config.js'; // Импорт db
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Swiper
    const swiper = new Swiper('.swiper', {
        effect: 'slide',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }
    });

    // Получаем новости из Firebase
    const newsRef = ref(db, 'news');

    onValue(newsRef, (snapshot) => {
        const news = snapshot.val();
        if (news) {
            const newsArray = Object.values(news);
            displayLatestNews(newsArray); // Вызываем функцию
        } else {
            console.log("Нет данных новостей");
            const newsContainer = document.querySelector('.news-container');
            if (newsContainer) {
                newsContainer.innerHTML = "<p>Новостей пока нет.</p>";
            }
        }
    }, (error) => { // Добавлена обработка ошибок
        console.error("Ошибка получения новостей:", error);
        const newsContainer = document.querySelector('.news-container');
        if (newsContainer) {
            newsContainer.innerHTML = "<p>Ошибка при загрузке новостей.</p>";
        }
    });
});

function displayLatestNews(allNews) {
    try {
        // Берем последние 3 новости
        const latestNews = allNews.slice(0, 3);

        const newsContainer = document.querySelector('.news-container');
        if (newsContainer) {
            newsContainer.innerHTML = latestNews.map(item => `
                <div class="news-item">
                    <img src="${item.imageUrl}" alt="${item.title}">
                    <h3>${item.title}</h3>
                    <p>${item.excerpt}</p>
                    <span class="news-date">${item.date}</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Ошибка при отображении новостей:', error);
    }
}