// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

async function initializeFirebase() {
  try {
    const response = await fetch('/.netlify/functions/get-config'); //  ЗАПРАШИВАЕМ КОНФИГ
    if (!response.ok) {
      throw new Error(`Failed to fetch Firebase config: ${response.status}`);
    }
    const firebaseConfig = await response.json(); //  ПОЛУЧАЕМ JSON

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    return db;

  } catch (error) {
    console.error("Error initializing Firebase:", error);
    //  Здесь можно показать сообщение об ошибке пользователю,
    //  или предпринять другие действия.
    return null; //  Или выбросить ошибку дальше.
  }
}

export { initializeFirebase };