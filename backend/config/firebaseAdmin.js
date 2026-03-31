const admin = require('firebase-admin');

// Ініціалізація Firebase Admin
// Варіант 1: через змінну середовища GOOGLE_APPLICATION_CREDENTIALS
// Варіант 2: через прямий імпорт serviceAccountKey.json
// Варіант 3: якщо нічого не настроєно — працюємо без верифікації (dev mode)

let firebaseInitialized = false;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    firebaseInitialized = true;
  } else {
    try {
      const serviceAccount = require('./serviceAccountKey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
    } catch (e) {
      console.warn('⚠️  Firebase Admin: serviceAccountKey.json не знайдено. Auth middleware працюватиме в dev-режимі.');
    }
  }
} catch (e) {
  console.warn('⚠️  Firebase Admin init error:', e.message);
}

module.exports = { admin, firebaseInitialized };
