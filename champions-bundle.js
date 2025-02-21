import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getDifficultyNumber, getDifficultyStars, filterChampions, createChampionCard } from './champions-utils.js';

//utils.js
import {debounce, animateOnScroll, updatePagination} from './utils.js'; // ИСПРАВЛЕНО

import { roleCategories, difficultyLevels } from './data/constants.js'; // Импорт констант
import { db } from './firebase-config.js'; //  Импортируем db!

'use strict';

const CHAMPS_PER_PAGE = 12;

document.addEventListener('DOMContentLoaded', function() {
    const championsContainer = document.getElementById('champions-container');
    const searchInput = document.getElementById('champion-search');
    const noResults = document.getElementById('no-results');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const paginationContainer = document.getElementById('pagination-container');

    if (!championsContainer) {
        console.error('Необходимые элементы не найдены');
        return;
    }

    let currentFilters = {
        roles: ['all'],
        difficulty: 'all',
        search: ''
    };
    let currentPage = 1;
    let championsData = []; // Переменная для хранения данных

     //  Функция загрузки данных (ИЗМЕНЕНА)
    function loadChampionsData() {
        const championsRef = ref(db, '/'); //  Ссылка на champions

          onValue(championsRef, (snapshot) => { //  Используем onValue
            const data = snapshot.val();
              if (data) {
                 championsData = Object.values(data); // Преобразуем объект в массив
                displayChampions(championsData);
            } else {
              console.log("Нет данных чемпионов.");
              championsContainer.innerHTML = '<p>Не удалось загрузить данные чемпионов.</p>';
            }

          }, (error) => {
            console.error("Ошибка при загрузке данных:", error);
            championsContainer.innerHTML = '<p>Не удалось загрузить данные чемпионов.</p>';
          });
    }

    // Отображение чемпионов с пагинацией
    function displayChampions(champions) {
        const filteredChamps = filterChampions(champions, currentFilters); // Исправлено

        if (filteredChamps.length === 0) {
            if (noResults) noResults.style.display = 'block';
            championsContainer.innerHTML = '';
              updatePagination( // Исправлено
              paginationContainer,
              currentPage,
              CHAMPS_PER_PAGE,
              0, //  Всего элементов 0
              displayChampions
            );
            return;
        }

        if (noResults) noResults.style.display = 'none';

        const startIndex = (currentPage - 1) * CHAMPS_PER_PAGE;
        const paginatedChamps = filteredChamps.slice(startIndex, startIndex + CHAMPS_PER_PAGE);

        championsContainer.innerHTML = paginatedChamps
           .map(champion => createChampionCard(champion)) // Исправлено
           .join('')
          || '<p>Не удалось отобразить чемпионов</p>';
          updatePagination( //  Используем импортированную
              paginationContainer,
              currentPage,
              CHAMPS_PER_PAGE,
              filteredChamps.length,
               (newPage) => {
                 currentPage = newPage;
                 displayChampions(championsData); //  Используем championsData
               }
          );

    }


    // Обработчики событий (ИЗМЕНЕНЫ)
   filterButtons.forEach(button => {
     button.addEventListener('click', function() {
         filterButtons.forEach(btn => btn.classList.remove('active'));
         this.classList.add('active');

         const role = this.dataset.role;
         const difficulty = this.dataset.difficulty;

         if (role) {
             if (role === 'all') {
                 currentFilters.roles = ['all'];
             } else {
                 if (currentFilters.roles.includes('all')) {
                     currentFilters.roles = [role];
                 } else {
                     currentFilters.roles = currentFilters.roles.includes(role)
                         ? currentFilters.roles.filter(r => r !== role)
                         : [...currentFilters.roles, role];
                     if(currentFilters.roles.length > 1 && currentFilters.roles.includes('all')){
                        currentFilters.roles = [role];
                     }
                 }
             }
         }

         if (difficulty) {
             currentFilters.difficulty = difficulty === 'all' ? 'all' : parseInt(difficulty, 10); //  Преобразуем в число
         }

         currentPage = 1;
         displayChampions(championsData); //  Используем championsData
     });
 });


    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => { // ИСПРАВЛЕНО
            currentFilters.search = searchInput.value.trim().toLowerCase();
            currentPage = 1;
            displayChampions(championsData);
        }, 300));
    }

    //  Инициализация
    loadChampionsData(); //  ЗАГРУЖАЕМ ДАННЫЕ
    animateOnScroll(); // ИСПРАВЛЕНО
});