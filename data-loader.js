'use strict';

export async function loadDataWithRetry(url, retries = 3) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Данные не найдены (404): ${url}`);
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        if (retries > 0) {
            console.warn(`Ошибка загрузки данных (${url}), осталось попыток: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return loadDataWithRetry(url, retries - 1);
        } else {
            throw error; // Перебрасываем ошибку
        }
    }
}

export async function loadNewsData() {
    try {
        const data = await loadDataWithRetry('/data/news.json');
        return data || [];
    } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
        throw error; // Перебрасываем ошибку наверх, а не возвращаем пустой массив
    }
}