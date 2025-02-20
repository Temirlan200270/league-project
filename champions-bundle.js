// --- champions-bundle.js ---
import { getDifficultyNumber, getDifficultyStars, filterChampions, createChampionCard } from './champions-utils.js';
import utils from './utils.js';
import { roleCategories, difficultyLevels } from './data/constants.js';
import { db } from './firebase-config.js'; // Импортируем db
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

'use strict';

const CHAMPS_PER_PAGE = 12;

document.addEventListener('DOMContentLoaded', function() {
    const championsContainer = document.getElementById('champions-container');
    const searchInput = document.getElementById('champion-search');
    const noResults = document.getElementById('no-results');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const paginationContainer = document.getElementById('pagination-container');

    // Проверяем наличие всех необходимых элементов
    if (!championsContainer || !searchInput || !noResults || filterButtons.length === 0 || !paginationContainer) {
        console.error('Необходимые элементы не найдены на странице.');
        return;
    }

    let currentFilters = {
        roles: ['all'],
        difficulty: 'all',
        search: ''
    };
    let currentPage = 1;
    let championsData = []; // Здесь будем хранить данные о чемпионах

    // ---  ФУНКЦИЯ ЗАГРУЗКИ ДАННЫХ (Firebase) ---
     async function loadChampionsData() {
        const championsRef = ref(db, '/'); //  Изменено:  Указываем корень базы данных

        onValue(championsRef, (snapshot) => {
            const championsDataRaw = snapshot.val();

             if (championsDataRaw) {
                // Преобразуем объект в массив, если данные хранятся с числовыми ключами
                championsData = Object.values(championsDataRaw);
                console.log("Загруженные данные чемпионов из Firebase:", championsData); //  ПРОВЕРКА
                displayChampions(championsData); // Отображаем чемпионов
            } else {
                console.log("Нет данных о чемпионах в Firebase.");
                championsContainer.innerHTML = '<p>Не удалось загрузить данные чемпионов.</p>';
            }
        }, (error) => {
            console.error('Ошибка при загрузке данных из Firebase:', error);
            championsContainer.innerHTML = '<p>Не удалось загрузить данные чемпионов.</p>';
        });
    }

   // Отображение чемпионов с пагинацией
    function displayChampions(champions) {
      console.log("Данные чемпионов для отображения:", champions); // ПРОВЕРКА: Данные, переданные в displayChampions
      const filteredChamps = filterChampions(champions, currentFilters); // ИЗМЕНЕНО:  Убрали championsUtils.


      if (filteredChamps.length === 0) {
          noResults.style.display = 'block';
          championsContainer.innerHTML = '';
          utils.updatePagination(
            paginationContainer,
            currentPage,
            CHAMPS_PER_PAGE,
            0,
            displayChampions
          );
          return;
      }

      noResults.style.display = 'none';

      const startIndex = (currentPage - 1) * CHAMPS_PER_PAGE;
      const paginatedChamps = filteredChamps.slice(startIndex, startIndex + CHAMPS_PER_PAGE);


      championsContainer.innerHTML = paginatedChamps
          .map(champion => createChampionCard(champion)) // ИЗМЕНЕНО: Убрали championsUtils.
          .join('')
        || '<p>Не удалось отобразить чемпионов</p>';

        utils.updatePagination(
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



    // Обработчики событий для кнопок фильтрации
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

            currentPage = 1; // Сбрасываем страницу при изменении фильтров
            displayChampions(championsData); //  Используем championsData
        });
    });

    // Обработчик события для поля поиска (с использованием debounce)
    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce(() => {
            currentFilters.search = searchInput.value.trim().toLowerCase();
            currentPage = 1;
            displayChampions(championsData); //  Используем championsData
        }, 300));
    }

    // Загрузка данных и инициализация страницы
    loadChampionsData();
});