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
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// ─── Профілі користувачів ───────────────────────────────────────────────────

export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function getAllStudents() {
  const q = query(collection(db, 'users'), where('role', '==', 'student'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

/**
 * Batch-fetches user profiles by UIDs.
 * @param {string[]} uids
 * @returns {Promise<Array<{uid:string, displayName:string, email:string, role:string}>>}
 */
export async function getUsersByIds(uids) {
  if (!uids || uids.length === 0) return [];
  const results = await Promise.all(uids.map((uid) => getDoc(doc(db, 'users', uid))));
  return results
    .filter((snap) => snap.exists())
    .map((snap) => ({ uid: snap.id, ...snap.data() }));
}


// ─── Завдання (Assignments) ─────────────────────────────────────────────────

export async function createAssignment(data) {
  return addDoc(collection(db, 'assignments'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateAssignment(id, data) {
  await updateDoc(doc(db, 'assignments', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAssignment(id) {
  await deleteDoc(doc(db, 'assignments', id));
}

export async function getAssignments() {
  const q = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Надсилання робіт (Submissions) ────────────────────────────────────────

export async function submitWork(assignmentId, studentId, file) {
  const storageRef = ref(storage, `submissions/${assignmentId}/${studentId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const fileURL = await getDownloadURL(storageRef);

  const q = query(
    collection(db, 'submissions'),
    where('assignmentId', '==', assignmentId),
    where('studentId', '==', studentId)
  );
  const existing = await getDocs(q);

  if (!existing.empty) {
    await updateDoc(existing.docs[0].ref, {
      fileURL,
      submittedAt: serverTimestamp(),
    });
    return existing.docs[0].id;
  } else {
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

export async function gradeSubmission(submissionId, grade, comment) {
  await updateDoc(doc(db, 'submissions', submissionId), {
    grade,
    comment,
    gradedAt: serverTimestamp(),
  });
}

export async function getSubmissionsForAssignment(assignmentId) {
  const q = query(
    collection(db, 'submissions'),
    where('assignmentId', '==', assignmentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSubmissionsForStudent(studentId) {
  const q = query(
    collection(db, 'submissions'),
    where('studentId', '==', studentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Оголошення (Announcements / Class Stream) ─────────────────────────────

/**
 * Публікує оголошення у стрімі класу.
 * @param {{ title:string, body:string, authorId:string, authorName:string, pinned?:boolean }} data
 */
export async function createAnnouncement(data) {
  return addDoc(collection(db, 'announcements'), {
    ...data,
    pinned: data.pinned ?? false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Підписка на оголошення в реальному часі (onSnapshot).
 * @param {(announcements: Array) => void} callback
 * @returns {function} unsubscribe
 */
export function subscribeAnnouncements(callback) {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function deleteAnnouncement(id) {
  await deleteDoc(doc(db, 'announcements', id));
}

// ─── Коментарі до оголошень ─────────────────────────────────────────────────

export async function addAnnouncementComment(announcementId, { authorId, authorName, text }) {
  return addDoc(collection(db, 'announcement_comments'), {
    announcementId,
    authorId,
    authorName,
    text,
    createdAt: serverTimestamp(),
  });
}

export function subscribeAnnouncementComments(announcementId, callback) {
  const q = query(
    collection(db, 'announcement_comments'),
    where('announcementId', '==', announcementId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ─── Приватні коментарі до здачі (Submission Comments) ─────────────────────

/**
 * Додає коментар до конкретної здачі (submission).
 * Видно лише вчителю + студенту цієї здачі.
 * @param {{ submissionId:string, assignmentId:string, authorId:string, authorName:string, role:'teacher'|'student', text:string }} data
 */
export async function addSubmissionComment(data) {
  const docRef = await addDoc(collection(db, 'submission_comments'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Підписка на коментарі до здачі у реальному часі.
 * @param {string} submissionId
 * @param {(comments: Array) => void} callback
 * @returns {function} unsubscribe
 */
export function subscribeSubmissionComments(submissionId, callback) {
  const q = query(
    collection(db, 'submission_comments'),
    where('submissionId', '==', submissionId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ─── Сповіщення (Notifications) ─────────────────────────────────────────────

/**
 * Створює сповіщення для конкретного користувача.
 * @param {string} userId
 * @param {'grade'|'comment'|'assignment'|'announcement'} type
 * @param {string} refId  — id assignment/submission/announcement
 * @param {string} message — Текст для відображення
 */
export async function createNotification(userId, type, refId, message) {
  await addDoc(collection(db, 'notifications'), {
    userId,
    type,
    refId,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Підписка на сповіщення поточного користувача у реальному часі.
 * @param {string} userId
 * @param {(notifications: Array, unreadCount: number) => void} callback
 * @returns {function} unsubscribe
 */
export function subscribeNotifications(userId, callback) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const unread = all.filter((n) => !n.read).length;
    callback(all, unread);
  });
}

/**
 * Позначає всі непрочитані сповіщення як прочитані.
 * @param {string} userId
 */
export async function markAllNotificationsRead(userId) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

// ─── Класи та запрошення ────────────────────────────────────────────────────

/** Генерує унікальний 6-символьний код (A-Z0-9) */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/**
 * Повертає клас вчителя (або створює новий, якщо немає).
 * @param {string} teacherId
 * @param {string} teacherName
 * @param {string} className
 */
export async function createOrGetClass(teacherId, teacherName, className = 'Мій клас') {
  // Шукаємо існуючий клас цього вчителя
  const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  }
  // Генеруємо код, перевіряємо унікальність
  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const codeSnap = await getDocs(
      query(collection(db, 'classes'), where('code', '==', code))
    );
    if (codeSnap.empty) break;
    code = generateCode();
    attempts++;
  }
  const ref = await addDoc(collection(db, 'classes'), {
    teacherId,
    teacherName,
    name: className,
    code,
    studentIds: [],
    createdAt: serverTimestamp(),
  });
  const created = await getDoc(ref);
  return { id: created.id, ...created.data() };
}

/**
 * Підписується на клас вчителя в реальному часі.
 */
export function subscribeClassForTeacher(teacherId, callback) {
  const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
  return onSnapshot(q, (snap) => {
    if (snap.empty) { callback(null); return; }
    const d = snap.docs[0];
    callback({ id: d.id, ...d.data() });
  });
}

export function subscribeClassesForTeacher(teacherId, callback) {
  const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
  return onSnapshot(q, (snap) => {
    const classes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    classes.sort((a, b) => {
      const aMs = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
      const bMs = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
      return bMs - aMs;
    });
    callback(classes);
  });
}

export async function createNewClass(teacherId, teacherName, className) {
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const codeSnap = await getDocs(query(collection(db, 'classes'), where('code', '==', code)));
    if (codeSnap.empty) break;
    code = generateCode();
    attempts++;
  }
  const ref = await addDoc(collection(db, 'classes'), {
    teacherId,
    teacherName,
    name: className,
    code,
    studentIds: [],
    createdAt: serverTimestamp(),
  });
  const created = await getDoc(ref);
  return { id: created.id, ...created.data() };
}

export async function updateClassName(classId, name) {
  await updateDoc(doc(db, 'classes', classId), { name });
}

export async function deleteClass(classId) {
  await deleteDoc(doc(db, 'classes', classId));
}

/**
 * Знаходить клас за кодом запрошення.
 */
export async function getClassByCode(code) {
  const q = query(collection(db, 'classes'), where('code', '==', code.toUpperCase().trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/**
 * Додає студента до класу.
 */
export async function joinClass(classId, studentId) {
  const ref = doc(db, 'classes', classId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Клас не знайдено');
  const current = snap.data().studentIds || [];
  if (current.includes(studentId)) return; // вже в класі
  await updateDoc(ref, { studentIds: [...current, studentId] });
}

/**
 * Знаходить клас, до якого приєднався студент.
 */
export async function getClassForStudent(studentId) {
  const q = query(collection(db, 'classes'), where('studentIds', 'array-contains', studentId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/**
 * Підписується на клас студента.
 */
export function subscribeClassForStudent(studentId, callback) {
  const q = query(collection(db, 'classes'), where('studentIds', 'array-contains', studentId));
  return onSnapshot(q, (snap) => {
    if (snap.empty) { callback(null); return; }
    const d = snap.docs[0];
    callback({ id: d.id, ...d.data() });
  });
}

/**
 * Видаляє студента з класу (вчитель може відрахувати).
 */
export async function removeStudentFromClass(classId, studentId) {
  const ref = doc(db, 'classes', classId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data().studentIds || [];
  await updateDoc(ref, { studentIds: current.filter((id) => id !== studentId) });
}

/**
 * Оновлює код класу (регенерація).
 */
export async function regenerateClassCode(classId) {
  const newCode = generateCode();
  await updateDoc(doc(db, 'classes', classId), { code: newCode });
  return newCode;
}
