// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Функция, принимающая объект конфигурации
function initializeFirebase(config) {
    const app = initializeApp(config);
    const db = getDatabase(app);
    return db;
}

export { initializeFirebase };