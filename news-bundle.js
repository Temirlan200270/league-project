'use strict';

import newsUtils from './news-utils.js';
import utils from './utils.js';
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { NEWS_CATEGORIES } from './data/constants.js'; //  ИСПРАВЛЕНО:  ./data/constants.js


const NEWS_PER_PAGE = 9;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');

    const newsGrid = document.querySelector('.news-grid');
    const searchInput = document.getElementById('news-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let currentPage = 1;
    let currentCategory = 'all';
    let newsData = []; //  Добавляем переменную для хранения данных

    // Проверяем наличие необходимых элементов
    if (!newsGrid) {
        console.error('Элемент news-grid не найден');
        return;
    }


	// Добавляем функцию загрузки данных
	function loadNewsData() {
		    const db = window.db;  //  Используем window.db, который мы определили в index.html
            const newsRef = ref(db, 'news');  //  "news" - это узел (папка) в твоей базе данных
            onValue(newsRef, (snapshot) => { //  Слушаем изменения
            const news = snapshot.val();
                if(news){
                    newsData = Object.values(news); // Преобразуем объект в массив
                    displayFilteredNews();
                } else {
                  console.log("Нет данных новостей");
                   newsGrid.innerHTML = '<p>Не удалось загрузить новости.</p>'; // Показываем сообщение об ошибке
                }

              }, (error) => { // Добавлена обработка ошибок
                console.error('Ошибка при загрузке данных:', error);
                newsGrid.innerHTML = '<p>Не удалось загрузить новости.</p>'; // Показываем сообщение об ошибке
              });
    }

    // Фильтрация и отображение новостей
  function displayFilteredNews() {
    console.log('Фильтрация новостей...');

    let filteredNews = newsData;

    // Фильтрация по категории
    if (currentCategory !== 'all') {
        filteredNews = filteredNews.filter(news => news.category === currentCategory);
    }

    // Фильтрация по поисковому запросу
    if (searchInput && searchInput.value.trim()) {
        const searchQuery = searchInput.value.trim().toLowerCase();
        filteredNews = filteredNews.filter(news =>
            news.title.toLowerCase().includes(searchQuery) ||
            news.excerpt.toLowerCase().includes(searchQuery)
        );
    }

        console.log('Отфильтрованные новости:', filteredNews);

        // Пагинация
        const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
        const paginatedNews = filteredNews.slice(startIndex, startIndex + NEWS_PER_PAGE);

        // Отображение новостей

        newsUtils.displayNews(paginatedNews); //  Используем newsUtils

       updatePagination(filteredNews.length); // Вызываем обычную функцию
    }


    // Обработчики событий
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            currentPage = 1;  // Сбрасываем страницу при смене фильтра
            displayFilteredNews();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce(() => {
            currentPage = 1; // Сбрасываем страницу при изменении поиска
            displayFilteredNews();
        }, 300));
    }

// Добавлена функция пагинации
function updatePagination(totalItems) {
        const paginationContainer = document.getElementById('news-pagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / NEWS_PER_PAGE);
        paginationContainer.innerHTML = '';

        // Кнопка "Назад"
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.className = 'pagination-btn';
            prevButton.textContent = 'Назад';
            prevButton.onclick = () => {
                currentPage--;
                displayFilteredNews();
            };
            paginationContainer.appendChild(prevButton);
        }

        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.onclick = () => {
                currentPage = i;
                displayFilteredNews();
            };
            paginationContainer.appendChild(pageButton);
        }

        // Кнопка "Вперед"
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.className = 'pagination-btn';
            nextButton.textContent = 'Вперед';
            nextButton.onclick = () => {
                currentPage++;
                displayFilteredNews();
            };
            paginationContainer.appendChild(nextButton);
        }
    }
       // Инициализация
       loadNewsData(); //  Загружаем данные
   });