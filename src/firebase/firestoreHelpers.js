// src/firebase/firestoreHelpers.js
// Усі CRUD-функції для роботи з Firestore + Storage

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// ─── Профілі користувачів ───────────────────────────────────────────────────

/**
 * Створює профіль користувача у Firestore при першому вході.
 * @param {string} uid
 * @param {{ displayName: string, email: string, role: 'teacher'|'student' }} data
 */
export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Повертає профіль користувача або null.
 * @param {string} uid
 * @returns {Promise<{displayName:string, email:string, role:string}|null>}
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ─── Завдання (Assignments) ─────────────────────────────────────────────────

/**
 * Додає нове завдання у Firestore.
 * @param {{ title:string, description:string, dueDate:Date, createdBy:string }} data
 */
export async function createAssignment(data) {
  return addDoc(collection(db, 'assignments'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Оновлює завдання.
 * @param {string} id
 * @param {Partial<{title:string, description:string, dueDate:Date}>} data
 */
export async function updateAssignment(id, data) {
  await updateDoc(doc(db, 'assignments', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Видаляє завдання.
 * @param {string} id
 */
export async function deleteAssignment(id) {
  await deleteDoc(doc(db, 'assignments', id));
}

/**
 * Повертає всі завдання, відсортовані за датою створення.
 * @returns {Promise<Array<{id:string, title:string, dueDate:any, ...}>>}
 */
export async function getAssignments() {
  const q = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Надсилання робіт (Submissions) ────────────────────────────────────────

/**
 * Завантажує файл у Firebase Storage і зберігає submission у Firestore.
 * @param {string} assignmentId
 * @param {string} studentId
 * @param {File} file
 */
export async function submitWork(assignmentId, studentId, file) {
  // 1. Завантаження файлу
  const storageRef = ref(storage, `submissions/${assignmentId}/${studentId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const fileURL = await getDownloadURL(storageRef);

  // 2. Пошук чи існує submission
  const q = query(
    collection(db, 'submissions'),
    where('assignmentId', '==', assignmentId),
    where('studentId', '==', studentId)
  );
  const existing = await getDocs(q);

  if (!existing.empty) {
    // Оновлюємо існуючий запис
    await updateDoc(existing.docs[0].ref, {
      fileURL,
      submittedAt: serverTimestamp(),
    });
    return existing.docs[0].id;
  } else {
    // Новий запис
    const ref2 = await addDoc(collection(db, 'submissions'), {
      assignmentId,
      studentId,
      fileURL,
      submittedAt: serverTimestamp(),
      grade: null,
      comment: null,
      gradedAt: null,
    });
    return ref2.id;
  }
}

/**
 * Виставляє оцінку та коментар до submission.
 * @param {string} submissionId
 * @param {number} grade  (0-100)
 * @param {string} comment
 */
export async function gradeSubmission(submissionId, grade, comment) {
  await updateDoc(doc(db, 'submissions', submissionId), {
    grade,
    comment,
    gradedAt: serverTimestamp(),
  });
}

/**
 * Повертає всі submissions для конкретного завдання.
 * @param {string} assignmentId
 */
export async function getSubmissionsForAssignment(assignmentId) {
  const q = query(
    collection(db, 'submissions'),
    where('assignmentId', '==', assignmentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Повертає всі submissions конкретного студента.
 * @param {string} studentId
 */
export async function getSubmissionsForStudent(studentId) {
  const q = query(
    collection(db, 'submissions'),
    where('studentId', '==', studentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
