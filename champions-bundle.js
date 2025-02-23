import { initializeFirebase } from './firebase-config.js';
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getDifficultyNumber, getDifficultyStars, filterChampions, createChampionCard } from './champions-utils.js';
import { debounce, animateOnScroll, updatePagination } from './utils.js';
import { roleCategories, difficultyLevels } from './data/constants.js';

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
    let championsData = [];

    // ИНИЦИАЛИЗАЦИЯ FIREBASE
    const db = initializeFirebase(window.firebaseConfig);

    function loadChampionsData() {
        const championsRef = ref(db, '/');
        onValue(championsRef, (snapshot) => {
            const data = snapshot.val();
              if (data) {
                 championsData = Object.values(data);
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

    function displayChampions(champions) {
        const filteredChamps = filterChampions(champions, currentFilters);

        if (filteredChamps.length === 0) {
            if (noResults) noResults.style.display = 'block';
            championsContainer.innerHTML = '';
              updatePagination(
              paginationContainer,
              currentPage,
              CHAMPS_PER_PAGE,
              0,
              displayChampions
            );
            return;
        }

        if (noResults) noResults.style.display = 'none';

        const startIndex = (currentPage - 1) * CHAMPS_PER_PAGE;
        const paginatedChamps = filteredChamps.slice(startIndex, startIndex + CHAMPS_PER_PAGE);

        championsContainer.innerHTML = paginatedChamps
           .map(champion => createChampionCard(champion))
           .join('')
          || '<p>Не удалось отобразить чемпионов</p>';
          updatePagination(
              paginationContainer,
              currentPage,
              CHAMPS_PER_PAGE,
              filteredChamps.length,
               (newPage) => {
                 currentPage = newPage;
                 displayChampions(championsData);
               }
          );

    }

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
             currentFilters.difficulty = difficulty === 'all' ? 'all' : parseInt(difficulty, 10);
         }

         currentPage = 1;
         displayChampions(championsData);
     });
 });


    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentFilters.search = searchInput.value.trim().toLowerCase();
            currentPage = 1;
            displayChampions(championsData);
        }, 300));
    }

    loadChampionsData();
    animateOnScroll();
});