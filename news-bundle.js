'use strict';

import newsUtils from './news-utils.js';
import { debounce, updatePagination } from './utils.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { NEWS_CATEGORIES } from './data/constants.js';
import { initializeFirebase } from './firebase-config.js';


const NEWS_PER_PAGE = 9;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded');

    const newsGrid = document.querySelector('.news-grid');
    const searchInput = document.getElementById('news-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
	 const paginationContainer = document.getElementById('news-pagination');
    let currentPage = 1;
    let currentCategory = 'all';
    let newsData = [];

    if (!newsGrid) {
        console.error('Элемент news-grid не найден');
        return;
    }
    // ИНИЦИАЛИЗАЦИЯ FIREBASE
    const db = await initializeFirebase(window.firebaseConfig);

	function loadNewsData() {
        const newsRef = ref(db, 'news');
        onValue(newsRef, (snapshot) => {
        const news = snapshot.val();
            if(news){
                newsData = Object.values(news);
                displayFilteredNews();
            } else {
              console.log("Нет данных новостей");
               newsGrid.innerHTML = '<p>Не удалось загрузить новости.</p>';
            }

          }, (error) => {
            console.error('Ошибка при загрузке данных:', error);
            newsGrid.innerHTML = '<p>Не удалось загрузить новости.</p>';
          });
    }

  function displayFilteredNews() {
    console.log('Фильтрация новостей...');

    let filteredNews = newsData;

    if (currentCategory !== 'all') {
        filteredNews = filteredNews.filter(news => news.category === currentCategory);
    }

    if (searchInput && searchInput.value.trim()) {
        const searchQuery = searchInput.value.trim().toLowerCase();
        filteredNews = filteredNews.filter(news =>
            news.title.toLowerCase().includes(searchQuery) ||
            news.excerpt.toLowerCase().includes(searchQuery)
        );
    }

        console.log('Отфильтрованные новости:', filteredNews);

        const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
        const paginatedNews = filteredNews.slice(startIndex, startIndex + NEWS_PER_PAGE);
        newsUtils.displayNews(paginatedNews);
        updatePagination(paginationContainer, currentPage, NEWS_PER_PAGE, filteredNews.length, displayFilteredNews);
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            currentPage = 1;
            displayFilteredNews();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentPage = 1;
            displayFilteredNews();
        }, 300));
    }


       loadNewsData();
   });