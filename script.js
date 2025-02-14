'use strict';

import { loadNewsData } from './data-loader.js';

// ЭТУ ФУНКЦИЮ НУЖНО ЭКСПОРТИРОВАТЬ, чтобы она была видна в news-page.js
export function displayNews(news, container, limit = 0, searchTerm = "") {
    container.replaceChildren(); // Очищаем контейнер

    if (news === undefined || news === null || news.length === 0) { // Исправленная проверка
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'Новости не найдены.';
        noResultsMessage.style.display = 'block';
        container.appendChild(noResultsMessage);
        return;
    }

    const newsToDisplay = limit > 0 ? news.slice(0, limit) : news;

    newsToDisplay.forEach(item => {
        const article = document.createElement('article');
        article.classList.add('news-item', 'fade-in');

        const img = document.createElement('img');
        img.src = item.imageUrl || 'pictures/placeholder.jpg';
        img.alt = `Изображение к новости: ${item.title}`;
        img.classList.add('news-image');
        img.loading = 'lazy';
        //img.onerror = () => { img.src = 'pictures/placeholder.jpg'; }; //УДАЛИЛИ, т.к. есть централизованный обработчик
        article.appendChild(img);

        const title = document.createElement('h3');
        title.innerHTML = highlightSearchTerm(item.title, searchTerm);
        article.appendChild(title);

        const content = document.createElement('p');
        content.innerHTML = highlightSearchTerm(item.content, searchTerm);
        article.appendChild(content);

        const date = new Date(item.date);
        const formattedDate = isNaN(date)
            ? 'Дата не указана'
            : new Intl.DateTimeFormat('ru', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

        const time = document.createElement('time');
        time.dateTime = item.date;
        time.textContent = formattedDate;
        article.appendChild(time);

        container.appendChild(article); // Убедитесь, что добавляете article в container
    });
}

function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function handleVideoError(element) {
    element.style.display = 'none';
    const errorP = document.createElement('p');
    errorP.textContent = 'Не удалось загрузить видео.';
    errorP.style.color = 'red';
    element.insertAdjacentElement('afterend', errorP);
    console.error('Ошибка загрузки видео:', element);
}

export function debounce(func, wait) { // ЭКСПОРТИРУЕМ debounce
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function initSwiper() { // Swiper initialization
    const swiperElement = document.querySelector('.swiper');
    if (swiperElement && swiperElement.querySelector('.swiper-wrapper').children.length > 0) {
        if (typeof Swiper !== 'undefined') { // Исправлено
            return new Swiper(swiperElement, {
                loop: true,
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                keyboard: { enabled: true },
            });
        } else {
            console.error('Swiper не загружен!');
            swiperElement.style.display = 'none';
            const fallbackDiv = document.createElement('div');
             fallbackDiv.innerHTML = swiperElement.innerHTML;
            swiperElement.parentNode.insertBefore(fallbackDiv, swiperElement);
        }
    }
    return null;
}

function setupFadeInAnimations() { // Fade-in animations
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    fadeElements.forEach(element => observer.observe(element));
}

function setupErrorHandling() {  // Centralized error handling
    document.addEventListener('error', (event) => {
        const target = event.target;
        if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
            if (target.tagName === 'IMG') {
                target.classList.add('image-load-error');
                target.src = 'pictures/placeholder.jpg';
            } else {
                handleVideoError(target);
            }
        }
    }, true);
}

const AudioPlayer = { // Audio player logic
    isPlaying: false,
    animationFrameId: null,
    audio: new Audio("sound/hall-of-legends-orchestral-theme-official-theme.mp3"), //  Проверьте путь!
    musicToggle: document.getElementById("music-toggle"),

    init() {
      if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
        console.error('Web Audio API не поддерживается.');
          if (this.musicToggle) {
            this.musicToggle.disabled = true;
            const errorP = document.createElement('p');
            errorP.textContent = 'Ваш браузер не поддерживает аудио.';
            errorP.style.color = 'red';
            this.musicToggle.parentNode?.insertBefore(errorP, this.musicToggle.nextSibling); // Optional chaining
          }
          return;
      }

        if (this.audio) {
            this.audio.loop = true;
            this.audio.addEventListener('canplaythrough', this.audioLoadHandler.bind(this));
            this.audio.addEventListener('error', this.audioErrorHandler.bind(this));
        } else {
            console.error("Аудиофайл не найден!");
            if (this.musicToggle) this.musicToggle.disabled = true;
        }

        if (this.musicToggle) {
            this.musicToggle.type = 'button';
            this.musicToggle.disabled = true;
            this.musicToggle.setAttribute('role', 'switch');
            this.musicToggle.setAttribute('aria-checked', 'false');
            this.musicToggle.setAttribute('aria-label', 'Вкл/выкл музыку');
             // Добавляем обработку клавиатуры
            this.musicToggle.addEventListener('keydown', (event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault();  // Предотвращаем стандартное действие (пробел может прокручивать страницу)
                    this.toggleMusic();
                }
            });
        }
    },

    audioLoadHandler() {
        if (this.musicToggle) {
            this.musicToggle.disabled = false;
            this.musicToggle.addEventListener("click", this.toggleMusic.bind(this));
        }
    },

  audioErrorHandler(e) {
    console.error("Audio loading error:", e.target.error); // Подробная информация об ошибке
    if (this.musicToggle) {
      this.musicToggle.disabled = true;
      const errorP = document.createElement('p');
      errorP.textContent = 'Не удалось загрузить аудио.';
      errorP.style.color = 'red';
      this.musicToggle.parentNode?.insertBefore(errorP, this.musicToggle.nextSibling); // Optional chaining
    }
  },

    toggleMusic() {
      if (!this.audio) return;

        this.isPlaying = !this.isPlaying;
        this.musicToggle.setAttribute('aria-checked', this.isPlaying.toString());
        this.musicToggle.setAttribute('aria-label', this.isPlaying ? 'Выкл музыку' : 'Вкл музыку');
        if(this.musicToggle){
          this.musicToggle.textContent = this.isPlaying ?  "Музыка: Вкл" : "Музыка: Выкл";
        }

        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (!this.isPlaying) {
            this.audio.volume = 0;
            this.audio.pause();
            return;
        }
      this.animateVolume();

    },
    animateVolume() { //Плавная анимация
       const duration = 1000; // Длительность анимации в миллисекундах (1 секунда)
        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            if (this.isPlaying) {
              if (this.audio.paused) { // Добавил проверку
                this.audio.volume = 0;
                this.audio.play().then(() => {
                    // Autoplay successful
                }).catch(error => {
                    console.error("Autoplay failed:", error);
                    this.isPlaying = false;
                    if (this.musicToggle) {
                        this.musicToggle.textContent = "Вкл/Выкл музыку";
                        this.musicToggle.setAttribute('aria-checked', 'false');
                        const enableSoundButton = document.createElement('button');
                        enableSoundButton.textContent = 'Включить звук';
                        enableSoundButton.classList.add('btn');
                        enableSoundButton.addEventListener('click', () => {
                            this.toggleMusic();
                            enableSoundButton.remove();
                        });
                        this.musicToggle.parentNode?.insertBefore(enableSoundButton, this.musicToggle.nextSibling);
                    }
                });
              }
                this.audio.volume = progress;
                if (progress < 1) {
                    this.animationFrameId = requestAnimationFrame(step);
                } else {
                    this.animationFrameId = null;
                }
            } else {
                 this.audio.volume = 1 - progress;
                  if (progress < 1) {
                    this.animationFrameId = requestAnimationFrame(step);
                } else {
                     this.animationFrameId = null;
                     this.audio.pause();
                }

            }
        };

        this.animationFrameId = requestAnimationFrame(step);
    }
};

function lazyLoad() {  // Lazy loading
    const lazyImages = document.querySelectorAll('img.lazy, video.lazy');
    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                if (element.tagName === 'IMG') {
                    element.src = element.dataset.src;
                } else if (element.tagName === 'VIDEO') {
                   const canPlay = element.canPlayType('video/mp4');
                    if(canPlay !== ''){
                      const videoSource = document.createElement('source');
                      videoSource.src = element.dataset.src;
                      videoSource.type = 'video/mp4';
                      element.appendChild(videoSource);
                      element.load();
                    } else {
                        handleVideoError(element);
                        return; // Добавлено
                    }
                }
                element.classList.remove('lazy');
                observer.unobserve(element);
            }
        });
    });
    lazyImages.forEach(lazyImage => io.observe(lazyImage));
}

document.addEventListener('DOMContentLoaded', async () => {
    initSwiper();
    setupFadeInAnimations();
    setupErrorHandling();
    lazyLoad();
    AudioPlayer.init();

    const newsContainer = document.getElementById('home-news-container');
    if (!newsContainer) {
        console.error('Не найден контейнер новостей на главной странице.');
        return;
    }

    let newsData = [];
    try {
      newsData = await loadNewsData();
        console.log("News Data in script.js:", newsData); // ЛОГИРОВАНИЕ
    } catch (error){
        console.error('Ошибка при зарузке новостей:', error);
         const errorMessageElement = document.createElement('p');
          errorMessageElement.textContent = 'Не удалось загрузить новости. Попробуйте позже.';
          errorMessageElement.style.color = 'red';
        newsContainer.appendChild(errorMessageElement);
        return;
    }


    if (newsData && newsData.length > 0) {
        console.log("Отображаем новости!");
        const sortedNews = newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      displayNews(sortedNews, newsContainer, 3);
    }  else {
        // Добавлено: Обработка случая, когда новостей нет
        const noNewsMessage = document.createElement('p');
        noNewsMessage.textContent = 'Новостей пока нет.';
        noNewsMessage.style.color = 'gray'; //  Можно добавить стилизацию
        newsContainer.appendChild(noNewsMessage);
    }
});