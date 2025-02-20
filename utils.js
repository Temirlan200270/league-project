'use strict';

// Общие утилиты
function debounce(func, wait, context) { // Добавлен context
    let timeout;
    return function(...args) {
        const self = context || this; // Используем context, если он передан
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(self, args), wait);
    };
}

function animateOnScroll(selector = '.fade-in') { // Сделали селектор параметром
   const fadeElements = document.querySelectorAll(selector);
   fadeElements.forEach(element => {
       const rect = element.getBoundingClientRect();
       if (rect.top < window.innerHeight && rect.bottom >= 0) {
           element.classList.add('visible');
       }
   });
}

// Добавлена функция для обновления пагинации
function updatePagination(container, currentPage, itemsPerPage, totalItems, displayFunction) {
        if (!container) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        container.innerHTML = '';

        // Кнопка "Назад"
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.className = 'pagination-btn';
            prevButton.textContent = 'Назад';
            prevButton.onclick = () => {
                displayFunction(currentPage - 1); // Передаём новую страницу
            };
            container.appendChild(prevButton);
        }

        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.onclick = () => {
                displayFunction(i); // Передаём новую страницу
            };
            container.appendChild(pageButton);
        }

        // Кнопка "Вперед"
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.className = 'pagination-btn';
            nextButton.textContent = 'Вперед';
            nextButton.onclick = () => {
                displayFunction(currentPage + 1); // Передаём новую страницу
            };
            container.appendChild(nextButton);
        }
    }


// Экспортируем утилиты
export default {  // ИЗМЕНЕНО:  Используем export default
    debounce,
    animateOnScroll,
    updatePagination // Добавили в экспорт
};