'use strict';

import { loadNewsData } from './data-loader.js';
import { displayNews, debounce } from './script.js';

document.addEventListener('DOMContentLoaded', async function() {
    const newsContainer = document.getElementById('news-container');
    const newsSearch = document.getElementById('news-search');
    const noResultsMessage = document.getElementById('no-results-message');
    const categoryCheckboxes = document.querySelectorAll('.news-categories input[type="checkbox"]');
    const errorMessageElement = document.querySelector('.error-message');

    if (!newsContainer || !newsSearch || !noResultsMessage || !categoryCheckboxes) {
        console.error('Не найдены необходимые DOM элементы на странице новостей.');
        return;
    }

    let newsData = [];

    try {
        newsData = await loadNewsData();
        console.log("News Data:", newsData); // ДОБАВЛЕНО: Логирование
    } catch (error) {
        console.error("Ошибка в news-page.js:", error);
        if(errorMessageElement){
          errorMessageElement.textContent = 'Не удалось загрузить новости. Пожалуйста, попробуйте позже.';
          errorMessageElement.style.display = 'block';
        }
        return;
    }

    function getSelectedCategories() {
      const selected = [];
         categoryCheckboxes.forEach(checkbox => {
           if (checkbox.checked) {
             selected.push(checkbox.value);
           }
         });
       return selected;
     }

   function searchNews() {
       const searchTerm = newsSearch.value.trim().toLowerCase();
       const selectedCategories = getSelectedCategories();

       const filteredNews = newsData.filter(item => {
           const textMatch = item.title.toLowerCase().includes(searchTerm) || item.content.toLowerCase().includes(searchTerm);

           let categoryMatch = false;
           if (selectedCategories.includes('all')) {
               categoryMatch = true;
           } else {
             if(Array.isArray(item.category)){
               categoryMatch = item.category.some(cat => selectedCategories.includes(cat));
             }else if (item.category){
               categoryMatch = selectedCategories.includes(item.category);
             }
           }

           return textMatch && categoryMatch;
       });

       displayNews(filteredNews, newsContainer, 0, searchTerm);
        if (filteredNews.length === 0) {
            noResultsMessage.style.display = 'block';
          } else {
            noResultsMessage.style.display = 'none';
          }
   }

   newsSearch.addEventListener('input', debounce(searchNews, 300));

   const newsCategories = document.querySelector('.news-categories');
   if(newsCategories){
     newsCategories.addEventListener('change', (event) => {
       const checkbox = event.target;
       if (checkbox.type === 'checkbox') {
           if (checkbox.value === 'all') {
               categoryCheckboxes.forEach(otherCheckbox => {
                   if (otherCheckbox !== checkbox) {
                       otherCheckbox.checked = false;
                   }
               });
           } else {
               document.querySelector('.news-categories input[type="checkbox"][value="all"]').checked = false;
           }
           searchNews();
       }
     });
   }


    if (newsData && newsContainer) { //Добавил проверку
        const sortedNews = newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        displayNews(sortedNews, newsContainer);
        console.log("Displaying news..."); // ДОБАВЛЕНО
    } else { //Добавил else
        console.error('newsData is null or undefined, or newsContainer is missing.');
    }
});