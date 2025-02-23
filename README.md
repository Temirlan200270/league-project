# 🎮 League of Legends Fan Site | Демо-проект для портфолио

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

Демонстрационный фанатский сайт по вселенной League of Legends, созданный для демонстрации навыков веб-разработки. 

🌐 **Демо-версия:** [Перейти по ссылке и посмотреть на Демо версию сайта](https://elaborate-crostata-2d9540.netlify.app/)

## 🚀 Особенности

### 🌈 Интерфейс
- **Адаптивный дизайн** (Mobile First)
- CSS-анимации и плавные переходы
- Параллакс-эффекты
- Ленивая загрузка изображений
- Кастомные темы с CSS-переменными

### ⚙️ Технологии
- **Core**: HTML5, CSS3 (Flexbox/Grid), ES6+
- **Библиотеки**: 
  ![Swiper](https://img.shields.io/badge/Swiper-6332F6?style=flat&logo=swiper&logoColor=white)
  ![Tippy.js](https://img.shields.io/badge/Tippy.js-333?style=flat)
- **База данных**: Firebase Realtime Database
- **Хостинг**: Netlify с CI/CD

### 🛡️ Безопасность
- Конфиденциальные данные защищены через Environment Variables
- Валидация и санитизация входных данных
- Обработка ошибок при запросах к API

## 🔍 Key Features Details

### 🖼️ Оптимизация изображений
- Использование WebP формата
- Респонсивные изображения с `<picture>`
- Ленивая загрузка через Intersection Observer

### 🔥 Firebase Integration
```javascript
// Пример получения чемпионов
const getChampions = async () => {
  try {
    const snapshot = await firebase.database().ref('champions').once('value');
    return snapshot.val();
  } catch (error) {
    showErrorNotification('Ошибка загрузки данных');
  }
}
```

### ♻️ Пагинация
- Динамическая подгрузка контента
- Кэширование данных
- Дебаунс запросов

## 📚 Ресурсы
- [Официальная документация LoL](https://developer.riotgames.com)
- [Firebase Guides](https://firebase.google.com/docs)
- [Swiper Documentation](https://swiperjs.com/swiper-api)

## 👨💻 Автор
**Ракымжан Темирлан**  
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github)](https://github.com/Temirlan200270)  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/темирлан-рахимжанов-9931a8264/)

