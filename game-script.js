// --- START OF FILE game-script.js ---
'use strict';

import utils from './utils.js'; // Импортируем

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Tippy.js с улучшенными настройками
    tippy('.tooltip', {
        theme: 'custom',
        placement: 'top',
        arrow: true,
        interactive: true,
        maxWidth: 350,
        delay: [100, 100], // Задержка появления/исчезновения
        duration: [200, 200], // Длительность анимации
        animation: 'shift-away', // Тип анимации
        inertia: true, // Плавное движение
        allowHTML: true, // Разрешаем HTML в подсказках
        appendTo: document.body, // Крепим к body для лучшего позиционирования
        zIndex: 9999, // Высокий z-index для перекрытия других элементов
    });

    // Обработка аккордеона
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');

        header.addEventListener('click', () => {
            const currentlyActive = document.querySelector('.accordion-item.active');

            if (currentlyActive && currentlyActive !== item) {
                currentlyActive.classList.remove('active');
            }

            item.classList.toggle('active');
        });
    });

    // Плавная прокрутка для навигации
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            targetSection.scrollIntoView({
                behavior: 'smooth'
            });

            // Обновление активной ссылки
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Информация о различных областях карты
    const mapInfo = {
        top: {
            title: "Верхняя линия",
            description: "Одиночная линия для танков и бойцов. Близко к Барону Нашору.",
            features: ["Одиночные бойцы", "Контроль Герольда", "Разделение карты"]
        },
        mid: {
            title: "Средняя линия",
            description: "Кратчайший путь между базами. Важна для контроля карты.",
            features: ["Быстрые ротации", "Контроль карты", "Помощь команде"]
        },
        bot: {
            title: "Нижняя линия",
            description: "Линия для стрелка и поддержки. Близко к дракону.",
            features: ["Стрелок и поддержка", "Контроль дракона", "Командные бои"]
        },
        jungle: {
            title: "Лес",
            description: "Территория между линиями с нейтральными монстрами.",
            features: ["Нейтральные монстры", "Ганки", "Контроль целей"]
        },
        dragon: {
            title: "Логово драконов",
            description: "Место появления драконов стихий.",
            features: ["Командные бонусы", "Душа дракона", "Контроль карты"]
        },
        baron: {
            title: "Барон Нашор",
            description: "Сильнейший нейтральный монстр на карте.",
            features: ["Усиление команды", "Осадный бонус", "Золото всей команде"]
        }
    };

    // Функция обновления информации
    function updateMapInfo(info) {
        const content = document.querySelector('.map-info-content');
        if (content) {
            content.innerHTML = `
                <h3>${info.title}</h3>
                <p>${info.description}</p>
                <ul>
                    ${info.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            `;
        }
    }

    // Обработчик для кнопки
    const mapButton = document.querySelector('.map-button');
    if (mapButton) {
        mapButton.addEventListener('click', function() {
            const mapInfo = document.querySelector('.map-info');
            if (mapInfo) {
                mapInfo.classList.toggle('active');
            }
        });
    }

    // Обработчики для областей карты
    document.querySelectorAll('area').forEach(area => {
        area.addEventListener('mouseenter', function() {
            const areaInfo = mapInfo[this.dataset.info];
            if (areaInfo) {
                updateMapInfo(areaInfo);
                const infoPanel = document.querySelector('.map-info');
                if (infoPanel) {
                    infoPanel.classList.add('active');
                }
            }
        });
    });

    // Добавляем обработчик для закрытия
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.map-interactive-container') &&
            !e.target.closest('.map-button')) {
            const mapInfo = document.querySelector('.map-info');
            if (mapInfo) {
                mapInfo.classList.remove('active');
            }
        }
    });

    // Обработка параллакс-эффекта
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    window.addEventListener('scroll', utils.debounce(() => { // Используем импортированный debounce
        const scrolled = window.pageYOffset;
        parallaxLayers.forEach(layer => {
            const speed = layer.dataset.depth || 0.5;
            const yOffset = -(scrolled * speed);
            layer.style.transform = `translateY(${yOffset}px)`;
        });
    }, 10));

    // Инициализация интерактивной карты
    initInteractiveMap();
});

// Функции для работы с интерактивной картой
function initInteractiveMap() {
    const modal = document.getElementById('interactive-map-modal');
    const mapTriggers = document.querySelectorAll('[data-map-trigger]');
    const closeBtn = modal.querySelector('.close');

    mapTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => openMapModal());
    });

    closeBtn.addEventListener('click', closeMapModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeMapModal();
    });

    // Инициализация тултипов для хотспотов
    tippy('.hotspot', {
        placement: 'top',
        animation: 'scale',
        theme: 'custom'
    });
}

function openMapModal() {
    const modal = document.getElementById('interactive-map-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeMapModal() {
    const modal = document.getElementById('interactive-map-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Анимации при скролле
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});