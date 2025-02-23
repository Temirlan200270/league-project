# League of Legends Fan Site (Демонстрационный проект)

Это демонстрационный проект фанатского сайта, посвященного игре League of Legends.  Проект создан в учебных целях для демонстрации навыков веб-разработки.

**Ссылка на сайт:** (https://elaborate-crostata-2d9540.netlify.app/))  <-- Замените на ВАШ URL!

## Особенности проекта:

*   **Статическая верстка:**  Сайт сверстан с использованием HTML, CSS и JavaScript без использования серверной части (кроме Firebase Realtime Database).
*   **Адаптивный дизайн:**  Сайт корректно отображается на устройствах с разным размером экрана (компьютеры, планшеты, мобильные телефоны).
*   **Использование CSS-переменных:**  Для обеспечения единообразия и упрощения поддержки стилей используются CSS-переменные (custom properties).
*   **Flexbox и Grid Layout:**  Для создания гибких и адаптивных макетов используются Flexbox и Grid Layout.
*   **JavaScript-анимации:**  Для улучшения пользовательского опыта используются JavaScript-анимации (плавное появление элементов, параллакс-эффект и т.д.).
*   **Swiper:**  Для создания карусели изображений используется библиотека Swiper.
*   **Tippy.js:**  Для создания всплывающих подсказок используется библиотека Tippy.js.
*   **Firebase Realtime Database:**  Для хранения данных (список чемпионов, новости) используется Firebase Realtime Database.  Реализована загрузка данных с помощью JavaScript.
*   **Безопасность:**  Конфиденциальные данные (ключи API Firebase) хранятся в переменных окружения Netlify и не раскрываются в коде.
*   **Развертывание на Netlify:** Сайт развернут на платформе Netlify.
*   **Ленивая загрузка:** Изображения загружаются по мере необходимости.
*   **Пагинация:** Новости и чемпионы отображаются с использованием пагинации.

## Структура проекта:

*   `index.html`:  Главная страница сайта.
*   `champions.html`:  Страница со списком чемпионов.
*   `news.html`:  Страница с новостями.
*   `account.html`:  Страница личного кабинета (имитация).
*   `game description.html`:  Страница с описанием игры.
*   `last update.html`: Страница информации о последнем обновлении.
*   `styles.css`:  Файл со стилями.
*   `script.js`:  Основной файл JavaScript (главная страница).
*   `champions-bundle.js`, `champions-utils.js`: JavaScript файлы для страницы чемпионов.
*   `news-bundle.js`, `news-utils.js`: JavaScript файлы для страницы новостей.
*   `account.js`:  JavaScript файл для страницы личного кабинета.
*   `code.js`: JavaScript файл с функциональностью для главной страницы.
*    `game-script.js`: JavaScript файл страницы описания игры
*   `utils.js`:  Общие утилиты (debounce, animateOnScroll).
*   `firebase-config.js`:  Файл с конфигурацией Firebase (использует переменные окружения Netlify).
*   `data/constants.js`: Файл с константами.
*   `pictures/`: Папка с изображениями.
*   `fonts/`: Папка со шрифтами (если используются).
*   `sound/`: Папка со звуковым сопровождением.

## Используемые технологии:

*   HTML5
*   CSS3 (включая Flexbox и Grid)
*   JavaScript (ES6+)
*   Firebase Realtime Database
*   Netlify
*   Swiper.js
*   Tippy.js
*   Font Awesome

## Как запустить локально (необязательно):

1.  Склонируйте репозиторий:  `git clone <your-repository-url>`
2.  Перейдите в папку проекта:  `cd <project-folder>`
3.  Откройте файл `index.html` в браузере.

*Примечание:*  Для корректной работы с Firebase локально вам потребуется создать *отдельный* проект Firebase и использовать *свои* ключи API.  Вы можете временно добавить их в `firebase-config.js` для локального тестирования, *но не забудьте удалить их перед коммитом*.

## Автор:

[Ваше имя/никнейм]

## Лицензия:

[Укажите лицензию, если необходимо.  Например, MIT]
