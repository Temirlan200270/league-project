import { db } from './firebase-config.js'; // Импортируем db
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import newsUtils from './news-utils.js'; // ИМПОРТИРУЕМ!

document.addEventListener('DOMContentLoaded', function() {

  // Получаем новости из Firebase
  const newsRef = ref(db, 'news');

  onValue(newsRef, (snapshot) => {
      const news = snapshot.val();
      if (news) {
            const newsArray = Object.values(news);
            displayLatestNews(newsArray); // вызываем функцию
      } else {
          console.log("Нет данных новостей");
          const newsContainer = document.querySelector('.latest-news-section .news-grid');
          if (newsContainer) {
              newsContainer.innerHTML = "<p>Новостей пока нет.</p>";
          }
      }

  }, (error) => {
    console.error("Ошибка получения новостей:", error);
     const newsContainer = document.querySelector('.latest-news-section .news-grid');
      if (newsContainer) {
          newsContainer.innerHTML = "<p>Ошибка при загрузке новостей.</p>";
      }
  });
});

function displayLatestNews(allNews) {
  try {
    // Сортируем новости по дате (от новых к старым)
    const sortedNews = allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Берем последние 3 новости
    const latestNews = sortedNews.slice(0, 3);

    const newsContainer = document.querySelector('.latest-news-section .news-grid'); // Правильный селектор

    if (newsContainer) {
        // ИСПОЛЬЗУЕМ newsUtils.createNewsCard!
        newsContainer.innerHTML = latestNews.map(item => newsUtils.createNewsCard(item)).join('');
    }
  } catch (error) {
    console.error('Ошибка при отображении новостей:', error);
  }
}