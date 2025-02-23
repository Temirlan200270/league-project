import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { initializeFirebase } from './firebase-config.js';

'use strict';

document.addEventListener('DOMContentLoaded', function() {
  // ... (все DOM-элементы и проверки) ...
  const loginButton = document.getElementById('login-button');
  const loginUsernameInput = document.getElementById('login-username');
  const loginPasswordInput = document.getElementById('login-password');
  const loginArea = document.querySelector('.login-area');
  const loginError = document.getElementById('login-error');
  const profileInfo = document.querySelector('.profile-info');
  const profileStats = document.querySelector('.profile-stats');
  const userAvatar = document.getElementById('user-avatar');
  const profileInfoList = document.getElementById('profile-info-list');
  const profileStatsList = document.getElementById('profile-stats-list');

  // ИНИЦИАЛИЗАЦИЯ FIREBASE
    const db = initializeFirebase(window.firebaseConfig);

   loginButton.addEventListener('click', function(e) {
        e.preventDefault();

        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();

        const usersRef = ref(db, 'users');

        onValue(usersRef, (snapshot) => {
            const users = snapshot.val();
            if (users) {
                let userFound = false;
                for (const userId in users) { //  Перебираем пользователей
                    const user = users[userId];
                    //  Проверяем логин и пароль (имитация)
                    if (user.id === username && password === "password") {  //  Проверяй user.id
                        userFound = true;
                        // Скрываем форму и показываем профиль
                        loginArea.style.display = 'none';
                        loginError.style.display = 'none';
                        profileInfo.style.display = 'block';
                        profileStats.style.display = 'block';

                        // Обновляем информацию профиля
                        userAvatar.src = user.avatarUrl;
                        userAvatar.alt = user.name;

                        profileInfoList.innerHTML = `
                            <li><strong>Имя:</strong> ${user.name}</li>
                            <li><strong>ID:</strong> ${user.id}</li>
                            <li><strong>Уровень:</strong> ${user.level}</li>
                        `;

                        profileStatsList.innerHTML = `
                            <li><strong>Победы:</strong> ${user.stats.wins}</li>
                            <li><strong>Поражения:</strong> ${user.stats.losses}</li>
                            <li><strong>Винрейт:</strong> ${user.stats.winrate}</li>
                            <li><strong>Лучший чемпион:</strong> ${user.stats.bestChampion}</li>
                            <li><strong>Лучший сезон:</strong> ${user.stats.bestSeason}</li>
                        `;
                        break; // Выходим из цикла, если нашли
                    }
                }
                if (!userFound) {
                    loginError.style.display = 'block';
                    loginError.textContent = 'Неверный логин или пароль.';
                    profileInfo.style.display = 'none';
                    profileStats.style.display = 'none';
                }
            } else {
                 console.log("Нет данных о пользователях.");
                loginError.style.display = 'block';
                loginError.textContent = 'Нет данных о пользователях.'; 
                profileInfo.style.display = 'none';
                profileStats.style.display = 'none';
            }
        }, (error) => { // Добавлена обработка ошибок
            console.error("Ошибка получения данных:", error);
            loginError.style.display = 'block'; //Показываем сообщение об ошибке
            loginError.textContent = "Ошибка при загрузке данных.  Пожалуйста обновите страницу.";
        });
    });
});