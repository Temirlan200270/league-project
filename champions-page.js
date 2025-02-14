'use strict';

import { loadDataWithRetry } from './data-loader.js';
import { debounce } from './script.js';

const DIFFICULTY = {
    LOW: 'Low',
    MODERATE: 'Moderate',
    HIGH: 'High',
    ALL: 'all'
};

const difficultyTranslations = {
    [DIFFICULTY.LOW]: 'Низкая',
    [DIFFICULTY.MODERATE]: 'Средняя',
    [DIFFICULTY.HIGH]: 'Высокая',
    [DIFFICULTY.ALL]: 'Все'
};

const ROLE = {
    FIGHTER: 'Fighter',
    TANK: 'Tank',
    MAGE: 'Mage',
    ASSASSIN: 'Assassin',
    SUPPORT: 'Support',
    MARKSMAN: 'Marksman',
    ALL: 'all'
};

const roleTranslations = {
    [ROLE.FIGHTER]: 'Боец',
    [ROLE.TANK]: 'Танк',
    [ROLE.MAGE]: 'Маг',
    [ROLE.ASSASSIN]: 'Убийца',
    [ROLE.SUPPORT]: 'Поддержка',
    [ROLE.MARKSMAN]: 'Стрелок',
    [ROLE.ALL]: 'Все'
};

const SORT = {
    NAME_ASC: 'name-asc',
    NAME_DESC: 'name-desc',
    DIFFICULTY_ASC: 'difficulty-asc',
    DIFFICULTY_DESC: 'difficulty-desc'
};

const elements = {
    list: document.getElementById('champions-list'),
    roleFilters: document.querySelectorAll('.role-filters input[type="checkbox"]'),
    roleAllCheckbox: document.getElementById('role-all'),
    difficultyFilter: document.getElementById('difficulty-filter'),
    sortFilter: document.getElementById('sort-filter'),
    searchInput: document.getElementById('search-input'),
    resetFiltersButton: document.getElementById('reset-filters'),
    noResultsMessage: document.getElementById('no-champions-message')
};

let championsData = [];
let cachedSortKey = null;
let cachedSortedData = [];
let cachedFilters = null;
let currentPage = 1;
const championsPerPage = 6;

async function loadChampionsData() {
    const errorMessageElement = document.querySelector('.error-message');
    try {
        const data = await loadDataWithRetry('/data/champions.json');
        return data || [];
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        if (errorMessageElement) {
            errorMessageElement.textContent = 'Не удалось загрузить данные. Попробуйте позже.';
            errorMessageElement.style.display = 'block';
        }
        return [];
    }
}

function getSortedChampions(sortKey, data) {
  const filtersChanged =
    cachedFilters === null ||
    cachedFilters.roles.join(',') !== getSelectedRoles().join(',') ||
    cachedFilters.difficulty !== elements.difficultyFilter.value ||
    cachedFilters.search !== elements.searchInput.value.trim().toLowerCase();

  if (cachedSortKey === sortKey && !filtersChanged) {
    return cachedSortedData;
  }

  let sortedChampions = [...data];
  const difficultyOrder = { Low: 1, Moderate: 2, High: 3 };

  switch (sortKey) {
    case SORT.NAME_ASC:
      sortedChampions.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case SORT.NAME_DESC:
      sortedChampions.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case SORT.DIFFICULTY_ASC:
      sortedChampions.sort(
        (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      );
      break;
    case SORT.DIFFICULTY_DESC:
      sortedChampions.sort(
        (a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
      );
      break;
    default:
      sortedChampions.sort((a, b) => a.name.localeCompare(b.name));
  }

  cachedSortKey = sortKey;
  cachedSortedData = sortedChampions;
  cachedFilters = {
    roles: getSelectedRoles(),
    difficulty: elements.difficultyFilter.value,
    search: elements.searchInput.value.trim().toLowerCase(),
  };
  return sortedChampions;
}
function displayChampionsPage(pageNumber, champions) {
    const startIndex = (pageNumber - 1) * championsPerPage;
    const endIndex = startIndex + championsPerPage;
    const championsToShow = champions.slice(startIndex, endIndex);
    displayChampions(championsToShow);
    updatePaginationButtons(champions);
}

function updatePaginationButtons(champions) {
    const totalPages = Math.ceil(champions.length / championsPerPage);
    const prevPageButton = document.getElementById('prev-page-button');
    const nextPageButton = document.getElementById('next-page-button');
    const paginationInfo = document.querySelector('.pagination-info');

    paginationInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages || totalPages === 0;
    prevPageButton.setAttribute('aria-disabled', currentPage === 1);
    nextPageButton.setAttribute('aria-disabled', currentPage === totalPages || totalPages === 0);
}

function getFilteredChampions(){
  const filters = {
    roles: getSelectedRoles(),
    difficulty: elements.difficultyFilter.value,
    sort: elements.sortFilter.value,
    search: elements.searchInput.value.trim().toLowerCase()
  };

  let filtered = championsData;

    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(champ =>
            champ.name.toLowerCase().includes(searchTerm) ||
            champ.title.toLowerCase().includes(searchTerm)
        );
    }

    if (!filters.roles.includes(ROLE.ALL)) {
        filtered = filtered.filter(champ => {
            const roles = Array.isArray(champ.role) ? champ.role : [champ.role];
            return roles.some(role => filters.roles.includes(role));
        });
    }

    if (filters.difficulty !== DIFFICULTY.ALL) {
        filtered = filtered.filter(champ => champ.difficulty.toLowerCase() === filters.difficulty.toLowerCase());
    }
    return filtered;
}

async function init() {
    if (!elements.list || !elements.roleFilters || !elements.difficultyFilter ||
        !elements.searchInput || !elements.noResultsMessage || !elements.roleAllCheckbox || !elements.resetFiltersButton) {
        console.error("Не найдены DOM элементы!");
        return;
    }

    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.style.display = 'block';
    }

    championsData = await loadChampionsData();
    console.log("Champions Data:", championsData); // ПЕРЕНЕСЕНО СЮДА

    if (loadingMessage) {
      loadingMessage.style.display = 'none';
    }

    if (!championsData || championsData.length === 0) { // ДОБАВЛЕНА ПРОВЕРКА
        console.error("Нет данных о чемпионах!");
        const noChampionsMessage = document.getElementById('no-champions-message');
        if (noChampionsMessage) {
            noChampionsMessage.style.display = 'block';
        }
        return; // Выходим, если нет данных
    }

    const roleFiltersContainer = document.querySelector('.role-filters');
    if (roleFiltersContainer) {
        roleFiltersContainer.addEventListener('change', (event) => {
            const checkbox = event.target;
            if (checkbox.type === 'checkbox') {
                if (checkbox !== elements.roleAllCheckbox) {
                    elements.roleAllCheckbox.checked = false;
                }
                filterChampions();
            }
        });
    }

    elements.difficultyFilter.addEventListener('change', filterChampions);
    elements.sortFilter.addEventListener('change', filterChampions);
    elements.searchInput.addEventListener('input', debounce(filterChampions, 300));
    elements.resetFiltersButton.addEventListener('click', resetFilters);

    elements.roleAllCheckbox.addEventListener('change', function () {
        if (this.checked) {
            elements.roleFilters.forEach(checkbox => {
                if (checkbox !== elements.roleAllCheckbox) {
                    checkbox.checked = false;
                }
            });
        }
        filterChampions();
    });

    const prevPageButton = document.getElementById('prev-page-button');
    const nextPageButton = document.getElementById('next-page-button');

     if (!prevPageButton || !nextPageButton) {
        console.error("Не найдены кнопки пагинации!");
        return;
    }
    prevPageButton.addEventListener('click', () => handlePageChange(-1));
    nextPageButton.addEventListener('click', () => handlePageChange(1));

    displayChampionsPage(currentPage, championsData);
}

function handlePageChange(direction) {
  const totalPages = Math.ceil(getFilteredChampions().length / championsPerPage);
    if (direction === -1 && currentPage > 1) {
        currentPage--;
        displayChampionsPage(currentPage, getSortedChampions(elements.sortFilter.value, getFilteredChampions()));
    } else if (direction === 1 && currentPage < totalPages) {
        currentPage++;
        displayChampionsPage(currentPage, getSortedChampions(elements.sortFilter.value, getFilteredChampions()));
    }
}

function getSelectedRoles() {
    if (elements.roleAllCheckbox.checked) {
        return [ROLE.ALL];
    }
    return [...elements.roleFilters]
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
}

function filterChampions() {
    const filters = {
        roles: getSelectedRoles(),
        difficulty: elements.difficultyFilter.value,
        sort: elements.sortFilter.value,
        search: elements.searchInput.value.trim().toLowerCase()
    };

     let filtered = championsData;

    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(champ =>
            champ.name.toLowerCase().includes(searchTerm) ||
            champ.title.toLowerCase().includes(searchTerm)
        );
    }

    if (!filters.roles.includes(ROLE.ALL)) {
      filtered = filtered.filter((champ) => {
        const roles = Array.isArray(champ.role) ? champ.role : [champ.role];
        return roles.some((role) => filters.roles.includes(role));
      });
    }

    if (filters.difficulty !== DIFFICULTY.ALL) {
      filtered = filtered.filter(
        (champ) => champ.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    filtered = getSortedChampions(filters.sort, filtered);
    currentPage = 1;
    displayChampionsPage(currentPage, filtered);


    elements.roleFilters.forEach(checkbox => {
        if (filters.roles.includes(checkbox.value)) {
            checkbox.parentNode.classList.add('active');
        } else {
            checkbox.parentNode.classList.remove('active');
        }
    });

    const difficultyOptions = elements.difficultyFilter.options;
    for (let i = 0; i < difficultyOptions.length; i++) {
        if (difficultyOptions[i].value === filters.difficulty) {
            difficultyOptions[i].classList.add('active');
             elements.difficultyFilter.classList.add('filter-active');
        } else {
            difficultyOptions[i].classList.remove('active');
             elements.difficultyFilter.classList.remove('filter-active');
        }
    }

     const sortOptions = elements.sortFilter.options;
    for (let i = 0; i < sortOptions.length; i++) {
        if (sortOptions[i].value === filters.sort) {
            sortOptions[i].classList.add('active');
            elements.sortFilter.classList.add('filter-active');
        } else {
            sortOptions[i].classList.remove('active');
            elements.sortFilter.classList.remove('filter-active');
        }
    }
}

function resetFilters() {
    elements.roleAllCheckbox.checked = true;
    elements.roleFilters.forEach(checkbox => {
        if (checkbox !== elements.roleAllCheckbox) {
            checkbox.checked = false;
        }
        checkbox.parentNode.classList.remove('active');
    });

    elements.difficultyFilter.value = DIFFICULTY.ALL;
    elements.sortFilter.value = SORT.NAME_ASC;
    elements.searchInput.value = '';
    elements.difficultyFilter.classList.remove('filter-active');
    elements.sortFilter.classList.remove('filter-active');

    currentPage = 1;
    filterChampions();
}

function createChampionImage(champ) {
    const img = document.createElement('img');
    img.src = champ.imageUrl;
    img.alt = `Изображение чемпиона ${champ.name}`;
    img.onerror = () => {
        img.src = 'pictures/placeholder.jpg';
    };
    return img;
}

function createChampionName(champ) {
    const nameEl = document.createElement('h2');
    nameEl.textContent = champ.name;
    return nameEl;
}

function createChampionTitle(champ) {
    const titleEl = document.createElement('p');
    titleEl.className = 'champion-title';
    titleEl.textContent = champ.title;
    return titleEl;
}

function createChampionRole(champ) {
    const roleContainer = document.createElement('div');
    roleContainer.className = 'champion-role-icons';
    const roles = Array.isArray(champ.role) ? champ.role : [champ.role];

    roles.forEach(role => {
        const icon = document.createElement('i');
        icon.className = getRoleIconClass(role);
        icon.setAttribute('aria-label', roleTranslations[role]);
        roleContainer.appendChild(icon);
    });
    return roleContainer;
}

function getRoleIconClass(role) {
    switch (role) {
        case ROLE.FIGHTER:
            return 'fas fa-fist-raised';
        case ROLE.TANK:
            return 'fas fa-shield-alt';
        case ROLE.MAGE:
            return 'fas fa-hat-wizard';
        case ROLE.ASSASSIN:
            return 'fas fa-skull-crossbones';
        case ROLE.SUPPORT:
            return 'fas fa-hand-holding-heart';
        case ROLE.MARKSMAN:
            return 'fas fa-crosshairs';
        default:
            return 'fas fa-question';
    }
}

function createChampionDifficulty(champ) {
    const difficultyEl = document.createElement('div');
    difficultyEl.className = 'champion-difficulty';
    const difficultySpan = document.createElement('span');
    difficultySpan.className = `difficulty-indicator difficulty-${champ.difficulty.toLowerCase()}`;
    difficultyEl.appendChild(difficultySpan);
    difficultyEl.setAttribute('aria-label', `Сложность: ${difficultyTranslations[champ.difficulty] || champ.difficulty}`);
    return difficultyEl;
}

function createChampionDescription(champ) {
    const descEl = document.createElement('p');
    descEl.className = 'champion-description';
    descEl.textContent = champ.description;
    return descEl;
}

function createDetailsButton(champ) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'details-button btn';
    button.dataset.championName = champ.name;
    button.innerHTML = '<i class="fas fa-info-circle"></i> Подробнее';
    return button;
}

function createChampionCard(champ) {
    const li = document.createElement('li');
    li.className = 'champion-card fade-in';
    li.dataset.difficulty = champ.difficulty;
    li.setAttribute('role', 'listitem');

    li.appendChild(createChampionImage(champ));
    li.appendChild(createChampionName(champ));
    li.appendChild(createChampionTitle(champ));
    li.appendChild(createChampionRole(champ));
    li.appendChild(createChampionDifficulty(champ));
    li.appendChild(createChampionDescription(champ));
    li.appendChild(createDetailsButton(champ));
    return li;
}

function returnFocusToButton(triggeredButton) {
    if (triggeredButton) {
        triggeredButton.focus();
    }
}

function createModalContent(champion) {
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeModal = document.createElement('span');
    closeModal.className = 'close-modal';
    closeModal.textContent = '×';
    closeModal.setAttribute('aria-label', 'Закрыть');
    modalContent.appendChild(closeModal);

    const h2 = document.createElement('h2');
    h2.textContent = champion.name;
    h2.id = 'modal-title';
    modalContent.appendChild(h2);

    const img = document.createElement('img');
    img.src = champion.imageUrl;
    img.alt = `Изображение чемпиона ${champion.name}`;
    img.onerror = () => { img.src = 'pictures/placeholder.jpg'; };
    modalContent.appendChild(img);

    const modalInfo = document.createElement('div');
    modalInfo.className = 'modal-info';

     const titleP = document.createElement('p');
    titleP.innerHTML = `<strong>Титул:</strong> ${champion.title}`;
    modalInfo.appendChild(titleP);

    const rolesP = document.createElement('p');
    const rolesStrong = document.createElement('strong');
    rolesStrong.textContent = "Роли:";
    rolesP.appendChild(rolesStrong);
    rolesP.appendChild(createChampionRole(champion));
    modalInfo.appendChild(rolesP);


    const difficultyP = document.createElement('p');
    difficultyP.innerHTML = `<strong>Сложность:</strong> ${difficultyTranslations[champion.difficulty] || champion.difficulty}`;
    modalInfo.appendChild(difficultyP);

    const descP = document.createElement('p');
    descP.textContent = champion.detailedDescription || champion.description;
    descP.id = 'modal-description';
    modalInfo.appendChild(descP);

    const statsDiv = document.createElement('div');
    statsDiv.className = 'champion-stats';

    const healthP = document.createElement('p');
    healthP.innerHTML = `<strong>Здоровье:</strong> ${champion.health}`;
    statsDiv.appendChild(healthP);


    const manaEnergyP = document.createElement('p');
    if (champion.mana > 0) {
        manaEnergyP.innerHTML = `<strong>Мана:</strong> ${champion.mana}`;
    } else {
        manaEnergyP.innerHTML = `<strong>Энергия/Ресурс:</strong> ${champion.energy || 'Нет'}`;
    }
    statsDiv.appendChild(manaEnergyP);


    const attackDamageP = document.createElement('p');
    attackDamageP.innerHTML = `<strong>Сила атаки:</strong> ${champion.attackDamage}`;
    statsDiv.appendChild(attackDamageP);

    const armorP = document.createElement('p');
    armorP.innerHTML = `<strong>Броня:</strong> ${champion.armor}`;
    statsDiv.appendChild(armorP);

    const magicResistP = document.createElement('p');
    magicResistP.innerHTML = `<strong>Сопр. магии:</strong> ${champion.magicResist}`;
    statsDiv.appendChild(magicResistP);

    modalInfo.appendChild(statsDiv);

    const abilitiesDiv = document.createElement('div');
    abilitiesDiv.className = 'champion-abilities';

    const passiveH4 = document.createElement('h4');
    passiveH4.textContent = 'Пассивная способность';
    abilitiesDiv.appendChild(passiveH4);
    const passiveP = document.createElement('p');
    passiveP.textContent = champion.passiveDescription || 'Описание отсутствует.';
    abilitiesDiv.appendChild(passiveP);

    const qH4 = document.createElement('h4');
    qH4.textContent = 'Q - Умение';
    abilitiesDiv.appendChild(qH4);
    const qP = document.createElement('p');
    qP.textContent = champion.qDescription || 'Описание отсутствует.';
    abilitiesDiv.appendChild(qP);

    const wH4 = document.createElement('h4');
    wH4.textContent = 'W - Умение';
    abilitiesDiv.appendChild(wH4);
    const wP = document.createElement('p');
    wP.textContent = champion.wDescription || 'Описание отсутствует.';
    abilitiesDiv.appendChild(wP);

    const eH4 = document.createElement('h4');
    eH4.textContent = 'E - Умение';
    abilitiesDiv.appendChild(eH4);
    const eP = document.createElement('p');
    eP.textContent = champion.eDescription || 'Описание отсутствует.';
    abilitiesDiv.appendChild(eP);

    const rH4 = document.createElement('h4');
    rH4.textContent = 'R - Ультимейт';
    abilitiesDiv.appendChild(rH4);
    const rP = document.createElement('p');
    rP.textContent = champion.rDescription || 'Описание отсутствует.';
    abilitiesDiv.appendChild(rP);

    modalInfo.appendChild(abilitiesDiv);
    modalContent.appendChild(modalInfo);
    return modalContent;
}

function showDetailsModal(champion, button) {
   document.querySelectorAll('.champion-modal').forEach(modal => modal.remove());

    const modal = document.createElement('div');
    modal.className = 'champion-modal';
    modal.tabIndex = -1;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.setAttribute('aria-describedby', 'modal-description');

    const modalContent = createModalContent(champion);

    document.body.style.overflow = 'hidden';
    document.querySelectorAll('main, header, footer').forEach(el => el.setAttribute('aria-hidden', 'true'));

    const closeModal = modalContent.querySelector('.close-modal');
     const closeModalHandler = () => {
        modal.remove();
        document.body.style.overflow = '';
        document.querySelectorAll('main, header, footer').forEach(el => el.removeAttribute('aria-hidden'));
        returnFocusToButton(button); // Возвращаем фокус кнопке
    };
    closeModal.onclick = closeModalHandler; //  Закрытие по клику на крестик

     modal.appendChild(modalContent);
    document.body.appendChild(modal);
     modal.classList.add('open'); // Добавляем класс для открытия
    modal.focus(); // Фокус на модальное окно

    modal.addEventListener('click', (event) => {
      if (event.target === modal) { // Закрытие по клику вне контента
        closeModalHandler();
      }
    });

    modal.addEventListener('keydown', (event) => { //  Обработка клавиатуры
       const handleEscape = (event) => {
        if (event.key === 'Escape') {
          closeModalHandler();
           modal.removeEventListener('keydown', handleEscape); //  Удаляем обработчик, чтобы не было утечек
        }
       }
        handleEscape(event);

        if (event.key === 'Tab') {  //  Переключение фокуса внутри модального окна
             const focusableElements = modalContent.querySelectorAll(
                'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
}
function displayChampions(champions) {
    const noChampionsMessage = document.getElementById('no-champions-message');

    if (!champions || champions.length === 0) {
        noChampionsMessage.style.display = 'block';
        return; // Добавили return
    }

    noChampionsMessage.style.display = 'none';
    elements.list.replaceChildren(); // Очищаем список
    champions.forEach(champ => {
        elements.list.appendChild(createChampionCard(champ));
    });
}

// Делегирование событий для кнопок "Подробнее"
elements.list.addEventListener('click', (event) => {
  const button = event.target.closest('.details-button');
  if(button){
    const name = button.dataset.championName;
    const champion = championsData.find(c => c.name === name);
      if(champion){
        showDetailsModal(champion, button);
      }
  }
});

document.addEventListener('DOMContentLoaded', async () => {
    init();
});