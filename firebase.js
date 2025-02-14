import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


//---- Примеры работы с Firestore ----

//Получение всех чемпионов
export async function getChampions() {
    const championsCol = collection(db, "champions"); // "champions" - название коллекции
    const championSnapshot = await getDocs(championsCol);
    const championList = championSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Добавляем id
    return championList;
}

// Добавление чемпиона
export async function addChampion(championData) {
    const championsCol = collection(db, "champions");
    const docRef = await addDoc(championsCol, championData);
    return docRef.id; // Возвращаем ID добавленного документа
}

// Удаление чемпиона
export async function deleteChampion(championId){
  const champRef = doc(db, "champions", championId);
  await deleteDoc(champRef);
}

// Обновление чемпиона
export async function updateChampion(championId, updatedData){
  const champRef = doc(db, "champions", championId);
  await updateDoc(champRef, updatedData);
}



// Аналогично для новостей и пользователей.