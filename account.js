'use strict';

import { loadDataWithRetry } from './data-loader.js';

async function loadUserData() {
    try {
        const data = await loadDataWithRetry('/data/user.json');
        return data;
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        const errorMessageElement = document.querySelector('.error-message');
        if (errorMessageElement) {
            errorMessageElement.textContent = 'Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже.';
            errorMessageElement.style.display = 'block';
        }
        return null; // Или другое значение по умолчанию
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');
    const profileInfo = document.querySelector('.profile-info');
    const profileStats = document.querySelector('.profile-stats');
    const profileInfoList = document.getElementById('profile-info-list');
    const profileStatsList = document.getElementById('profile-stats-list');
    const userAvatar = document.getElementById('user-avatar');
    const loginArea = document.querySelector('.login-area');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');

    if (!loginForm || !loginButton || !loginError || !profileInfo ||
        !profileStats || !profileInfoList || !profileStatsList ||
        !userAvatar || !loginArea || !loginUsernameInput || !loginPasswordInput) {
        console.error("Один или несколько необходимых DOM-элементов не найдены!");
        return;
    }

    profileInfo.style.display = 'none';
    profileStats.style.display = 'none';

    loginUsernameInput.addEventListener('click', () => {
        loginError.style.display = 'none';
    });

    loginPasswordInput.addEventListener('click', () => {
        loginError.style.display = 'none';
    });

    let userData = await loadUserData();  // Загружаем данные пользователя

    if (!userData) {
      //  loginArea.style.display = 'none';  // Убрал, так как ниже есть более общая обработка
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Ошибка при загрузке данных пользователя';
        errorDiv.style.color = 'red';

        const profileSection = document.querySelector('.profile-section');
        if (profileSection) {
            profileSection.appendChild(errorDiv);
        }
        return; // Выходим, если данные не загружены
    }


    loginButton.addEventListener('click', function() {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();

        if (typeof username !== 'string' || typeof password !== 'string') {
            loginError.style.display = 'block';
            loginError.textContent = 'Некорректный формат данных.';
            return;
        }

        if (!username || !password) {
            loginError.style.display = 'block';
            loginError.textContent = 'Пожалуйста, заполните все поля.';
            return;
        }

        if (username === 'test' && password === 'test') {
            loginError.style.display = 'none';
            loginArea.style.display = 'none';
            profileInfo.style.display = 'block';
            profileStats.style.display = 'block';

            userAvatar.src = userData.avatarUrl;
            profileInfoList.innerHTML = `
                <li><strong>Имя:</strong> ${userData.name}</li>
                <li><strong>ID:</strong> ${userData.id}</li>
                <li><strong>Уровень:</strong> ${userData.level}</li>
            `;
            let statsHtml = `
                <li><strong>Победы:</strong> ${userData.stats.wins}</li>
                <li><strong>Поражения:</strong> ${userData.stats.losses}</li>
                <li><strong>Винрейт:</strong> ${userData.stats.winrate}</li>
                <li><strong>Лучший чемпион:</strong> ${userData.stats.bestChampion}</li>
                <li><strong>Лучший сезон:</strong> ${userData.stats.bestSeason}</li>
                <li><strong>Ранг:</strong> ${userData.stats.rank}</li>
                <li><strong>Любимые чемпионы:</strong> ${userData.stats.favoriteChampions.join(', ')}</li>
            `;

            if (userData.stats.matchHistory && userData.stats.matchHistory.length > 0) {
                statsHtml += '<li><strong>История матчей:</strong><ul>';
                userData.stats.matchHistory.forEach(match => {
                    statsHtml += `<li>${match.date} - ${match.champion} - ${match.result} (${match.kda})</li>`;
                });
                statsHtml += '</ul></li>';
            }

            profileStatsList.innerHTML = statsHtml;
        } else {
            loginError.style.display = 'block';
            loginError.textContent = 'Неверный логин или пароль.';
            profileInfo.style.display = 'none'; // Скрываем, если ошибка
            profileStats.style.display = 'none';// Скрываем, если ошибка
        }
    });
});