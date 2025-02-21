import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

        const firebaseConfig = {
          apiKey: "AIzaSyDOhIh17GzSNHmfAwFLNh9Ju6MzpantVgc", //  ТВОЙ API KEY
          authDomain: "league-project-4047f.firebaseapp.com", //  ТВОЙ PROJECT ID
          databaseURL: "https://league-project-4047f-default-rtdb.europe-west1.firebasedatabase.app", //  ТВОЙ DATABASE URL (с регионом!)
          projectId: "league-project-4047f",       // ТВОЙ PROJECT ID
          storageBucket: "league-project-4047f.firebasestorage.app",
          messagingSenderId: "72373776156",
          appId: "1:72373776156:web:8f0c7a193b8cb9bae394d9"
        };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db }; // Экспортируем объект db, чтобы использовать его в других файлах