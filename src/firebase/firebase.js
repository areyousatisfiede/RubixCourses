// src/firebase/firebase.js
// Ініціалізація Firebase (Auth, Firestore, Storage)
// Читає ключі з .env (VITE_ prefix). Якщо ключів немає — gracefully деградує.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Graceful деградація — не блокуємо рендеринг якщо .env не заповнений
let app, auth, db, storage, googleProvider;

try {
  // Ініціалізуємо лише якщо ще не зроблено (HMR-safe)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  console.warn(
    '⚠️  Firebase не ініціалізувався. Перевірте файл .env\n' +
    'Скопіюйте .env.example → .env і вставте ключі з Firebase Console.\n' +
    `Помилка: ${e.message}`
  );
  // Заглушки щоб модуль не зломився при імпорті
  auth = null;
  db = null;
  storage = null;
  googleProvider = null;
}

export { auth, googleProvider, db, storage };
export default app;
