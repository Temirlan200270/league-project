// --- START OF FILE script.js ---

'use strict';
import { db } from './firebase-config.js';
import utils from './utils.js';

// Обработчик ошибок загрузки видео. Вставляет сообщение об ошибке ПОСЛЕ видеоэлемента.
function handleVideoError(element) {
    element.style.display = 'none';
    const errorP = document.createElement('p');
    errorP.textContent = 'Не удалось загрузить видео.';
    errorP.style.color = 'red';
    element.insertAdjacentElement('afterend', errorP); // Используем afterend
}

// Инициализация Swiper (если есть элемент .swiper на странице)
function initSwiper() {
    const swiperElement = document.querySelector('.swiper');
    if (swiperElement) {
        return new Swiper(swiperElement, {
            loop: true, // Бесконечная прокрутка
            pagination: {
                el: '.swiper-pagination', // Элемент пагинации
                clickable: true // Кликабельная пагинация
            },
            navigation: {
                nextEl: '.swiper-button-next', // Кнопка "вперед"
                prevEl: '.swiper-button-prev' // Кнопка "назад"
            },
            keyboard: {
                enabled: true, // Управление с клавиатуры
            },
        });
    }
}

// Анимации появления элементов при прокрутке
function setupFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Если элемент попадает в область видимости
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Добавляем класс visible
                observer.unobserve(entry.target); // Прекращаем наблюдение за элементом
            }
        });
    }, {
        threshold: 0.1 // Порог видимости (10%)
    });

    fadeElements.forEach(element => observer.observe(element));
}

// Централизованная обработка ошибок загрузки изображений и видео
function setupErrorHandling() {
    document.addEventListener('error', (event) => {
        const target = event.target;
        // Проверяем, является ли элемент изображением или видео
        if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
            if (target.tagName === 'IMG') {
                // Если это изображение, добавляем класс ошибки и меняем src на placeholder
                target.classList.add('image-load-error');
                target.src = 'pictures/placeholder.png'; // УКАЖИ ПРАВИЛЬНЫЙ ПУТЬ К placeholder.png!
            } else {
                // Если это видео, вызываем handleVideoError
                handleVideoError(target);
            }
        }
    }, true); // Используем capturing phase, чтобы перехватить событие до того, как оно всплывет
}


let isPlaying = false; // Флаг, проигрывается ли музыка
let animationFrameId = null; // Идентификатор анимации для плавной регулировки громкости
const audio = new Audio("sound/hall-of-legends-orchestral-theme-official-theme.mp3");  // ПУТЬ К АУДИОФАЙЛУ!
const musicToggle = document.getElementById("music-toggle"); // Кнопка включения/выключения музыки

// Проверяем существование audio элемента
if (audio) {
    audio.loop = true; // Зацикливаем воспроизведение
}

// Обработчик успешной загрузки аудио
function audioLoadHandler() {
    if (musicToggle) {
        musicToggle.disabled = false; // Включаем кнопку
        musicToggle.addEventListener("click", toggleMusic); // Добавляем обработчик клика
    }
}

// Добавляем обработчики событий для audio
if (audio) {
    audio.addEventListener('canplaythrough', audioLoadHandler); // Срабатывает, когда аудио достаточно загружено для воспроизведения

    // Обработчик ошибок загрузки аудио
    audio.addEventListener('error', (e) => {
        console.error("Audio loading error:", e); // Выводим ошибку в консоль
        if (musicToggle) {
            musicToggle.disabled = true; // Отключаем кнопку
            const errorP = document.createElement('p');
            errorP.textContent = 'Не удалось загрузить аудио.';
            errorP.style.color = 'red';

            // Вставляем сообщение об ошибке ПОСЛЕ кнопки
            if (musicToggle.parentNode) {
                musicToggle.parentNode.insertBefore(errorP, musicToggle.nextSibling);
            }
        }
    });
}

// Функция включения/выключения музыки с плавной анимацией громкости
function toggleMusic() {
    if (!audio) return; // Если audio элемент не создан, выходим

    isPlaying = !isPlaying; // Меняем состояние воспроизведения на противоположное

    // Если есть активная анимация, отменяем ее
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // "fallback" на случай проблем с requestAnimationFrame (сразу меняем громкость)
    if (!isPlaying) {
        audio.volume = 0;
        audio.pause();
        if (musicToggle) {
            musicToggle.textContent = "Вкл/Выкл музыку";
            musicToggle.setAttribute('aria-checked', 'false'); // ARIA: Музыка выключена
        }
        return;
    }

    // Функция для плавной анимации громкости
    function animateVolume() {
        if (isPlaying) { // Если музыка должна играть
             //Если paused = true;
            if (audio.paused) {
              audio.volume = 0; // начинаем с 0
              audio.play()
                .catch(error => { // ловим ошибки, если autoplay не сработает
                  console.error("Autoplay failed:", error);
                  isPlaying = false;

                  if (musicToggle) {
                    musicToggle.textContent = "Вкл/Выкл музыку";
                    musicToggle.setAttribute('aria-checked', 'false');
                  }
                });
            }
            // Увеличиваем громкость
            audio.volume = Math.min(1, audio.volume + 0.02); // Шаг 0.02
            if (audio.volume < 1) {
                // Если громкость еще не достигла максимума, продолжаем анимацию
                animationFrameId = requestAnimationFrame(animateVolume);
            } else {
                // Если громкость достигла максимума, останавливаем анимацию
                animationFrameId = null;
                if (musicToggle) {
                    musicToggle.textContent = "Вкл/Выкл музыку";
                    musicToggle.setAttribute('aria-checked', 'true');  // ARIA: Музыка включена
                }
            }
        } else { // Если музыка должна быть выключена
            // Уменьшаем громкость
            audio.volume = Math.max(0, audio.volume - 0.02); // Шаг 0.02
            if (audio.volume > 0) {
                // Если громкость еще не достигла минимума, продолжаем анимацию
                animationFrameId = requestAnimationFrame(animateVolume);
            } else {
                // Если громкость достигла минимума, останавливаем анимацию и ставим паузу
                animationFrameId = null;
                audio.pause();
                if (musicToggle) {
                  musicToggle.textContent = "Вкл/Выкл музыку";
                  musicToggle.setAttribute('aria-checked', 'false'); // ARIA: Музыка выключена
                }
            }
        }
    }

    // Запускаем анимацию
    animationFrameId = requestAnimationFrame(animateVolume);
}

// Настройка кнопки музыки
if (musicToggle) {
    musicToggle.type = 'button';        // Явно указываем тип кнопки
    musicToggle.disabled = true;         // Изначально отключаем кнопку (пока аудио не загружено)
    musicToggle.setAttribute('role', 'switch'); // ARIA: Добавляем роль "переключатель"
    musicToggle.setAttribute('aria-checked', 'false'); // ARIA: Начальное состояние - выключено
}

// Ленивая загрузка изображений и видео
function lazyLoad() {
    const lazyImages = document.querySelectorAll('img.lazy, video.lazy');

    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Если элемент попадает в область видимости
            if (entry.isIntersecting) {
                const element = entry.target;
                if (element.tagName === 'IMG') {
                    // Если это изображение, загружаем его
                    element.src = element.dataset.src;
                } else if (element.tagName === 'VIDEO') {
                    // Если это видео, загружаем его источник
                    const videoSource = element.querySelector('source');
                    if (videoSource) {
                        videoSource.src = element.dataset.src;
                    }
                    element.load(); // Начинаем загрузку видео
                }

                element.classList.remove('lazy'); // Удаляем класс lazy
                observer.unobserve(element); // Прекращаем наблюдение за элементом
            }
        });
    });

    lazyImages.forEach(lazyImage => io.observe(lazyImage));
}


// Инициализация после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    initSwiper();
    setupFadeInAnimations();
    setupErrorHandling();
    lazyLoad();
    utils.animateOnScroll(); // Вызываем импортированную функцию

    window.addEventListener('scroll', utils.debounce(() => { // Используем импортированный debounce
        utils.animateOnScroll();
    }, 100)); // 100 мс задержка

});