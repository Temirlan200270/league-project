import newsUtils from './news-utils.js'; // Импортируем
import { db } from './firebase-config.js'; // Импортируем db
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Swiper (без изменений)
   // ...

    // Получаем новости из Firebase
    const newsRef = ref(db, 'news');

    onValue(newsRef, (snapshot) => { //  Слушаем изменения
        const news = snapshot.val();
        if (news) {
            const newsArray = Object.values(news);
            newsUtils.displayNews(newsArray, 3); // Вызываем функцию,  ИСПРАВЛЕНО
        } else {
          console.log("Нет данных новостей");
           const newsContainer = document.querySelector('.news-container'); //  ИСПРАВЛЕНО
           if (newsContainer) {
            newsContainer.innerHTML = "<p>Новостей пока нет.</p>";
           }
        }

    }, (error) => {
      console.error("Ошибка получения новостей:", error);
       const newsContainer = document.querySelector('.news-container');  //  ИСПРАВЛЕНО
         if (newsContainer) {
              newsContainer.innerHTML = "<p>Ошибка при загрузке новостей.</p>";
         }
    });
});

function displayLatestNews(allNews) {
    try {
        // Берем последние 3 новости
        const latestNews = allNews.slice(0, 3);

        const newsContainer = document.querySelector('.news-container'); //  ИСПРАВЛЕНО: селектор
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