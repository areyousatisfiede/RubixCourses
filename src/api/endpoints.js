// src/api/endpoints.js — Усі API-виклики (замінюють firestoreHelpers.js)

import { apiGet, apiPost, apiPut, apiDelete, apiPostForm, BASE_URL } from './client';

// ═══════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════
export async function createUserProfile(uid, email, displayName, role) {
  return apiPost('/api/users', { uid, email, displayName, role });
}

export async function getUserProfile(uid) {
  return apiGet(`/api/users/${uid}`);
}

export async function getAllStudents() {
  return apiGet('/api/users/students');
}

export async function getUsersByIds(ids) {
  return apiPost('/api/users/batch', { ids });
}

// ═══════════════════════════════════════════════
// CLASSES
// ═══════════════════════════════════════════════
export async function createOrGetClass(teacherId, teacherName, className, courseName) {
  return apiPost('/api/classes/get-or-create', { teacherId, teacherName, className, courseName });
}

export async function createNewClass(teacherId, teacherName, name) {
  return apiPost('/api/classes', { teacherId, teacherName, name });
}

export async function getClassesByTeacher(teacherId) {
  return apiGet(`/api/classes/teacher/${teacherId}`);
}

export async function getClassesForStudent(studentId) {
  return apiGet(`/api/classes/student/${studentId}`);
}

export async function getClassByCode(code) {
  return apiGet(`/api/classes/by-code/${code}`);
}

export async function updateClassName(classId, name) {
  return apiPut(`/api/classes/${classId}`, { name });
}

export async function updateCourseName(classId, courseName) {
  return apiPut(`/api/classes/${classId}`, { courseName });
}

export async function deleteClass(classId) {
  return apiDelete(`/api/classes/${classId}`);
}

export async function joinClass(classId, studentId) {
  return apiPost(`/api/classes/${classId}/join`, { studentId });
}

export async function removeStudentFromClass(classId, studentId) {
  return apiPost(`/api/classes/${classId}/kick`, { studentId });
}

export async function regenerateClassCode(classId) {
  return apiPost(`/api/classes/${classId}/regen-code`, {});
}

/**
 * subscribeClassForTeacher — Polling замість Firestore realtime.
 * Повертає функцію unsubscribe (clearInterval).
 */
export function subscribeClassForTeacher(teacherId, callback) {
  let active = true;
  async function poll() {
    if (!active) return;
    try {
      const classes = await getClassesByTeacher(teacherId);
      if (classes.length > 0 && active) callback(classes[0]);
    } catch (e) {
      console.warn('subscribeClassForTeacher poll error:', e);
    }
  }
  poll();
  const interval = setInterval(poll, 5000);
  return () => { active = false; clearInterval(interval); };
}

export function subscribeClassesForTeacher(teacherId, callback) {
  let active = true;
  async function poll() {
    if (!active) return;
    try {
      const classes = await getClassesByTeacher(teacherId);
      if (active) callback(classes);
    } catch (e) {
      console.warn('subscribeClassesForTeacher poll error:', e);
    }
  }
  poll();
  const interval = setInterval(poll, 5000);
  return () => { active = false; clearInterval(interval); };
}

export function subscribeClassesForStudent(studentId, callback) {
  let active = true;
  async function poll() {
    if (!active) return;
    try {
      const classes = await getClassesForStudent(studentId);
      if (active) callback(classes);
    } catch (e) {
      console.warn('subscribeClassesForStudent poll error:', e);
    }
  }
  poll();
  const interval = setInterval(poll, 5000);
  return () => { active = false; clearInterval(interval); };
}

// ═══════════════════════════════════════════════
// ASSIGNMENTS
// ═══════════════════════════════════════════════
export async function getAssignments(createdBy, classId) {
  let q = createdBy ? `?createdBy=${createdBy}` : '';
  if (classId) {
    q += q ? `&classId=${classId}` : `?classId=${classId}`;
  }
  return apiGet(`/api/assignments${q}`);
}

export async function getAssignmentById(id) {
  return apiGet(`/api/assignments/${id}`);
}

export async function createAssignment(data, files) {
  if (files && files.length > 0) {
    const form = new FormData();
    form.append('title', data.title);
    form.append('description', data.description || '');
    if (data.dueDate) form.append('dueDate', data.dueDate);
    form.append('createdBy', data.createdBy);
    if (data.classId) form.append('classId', data.classId);
    files.forEach(f => form.append('files', f));
    return apiPostForm('/api/assignments', form);
  }
  return apiPost('/api/assignments', data);
}

export async function deleteAssignment(id) {
  return apiDelete(`/api/assignments/${id}`);
}

// ═══════════════════════════════════════════════
// SUBMISSIONS
// ═══════════════════════════════════════════════
export async function getSubmissionsForAssignment(assignmentId) {
  return apiGet(`/api/submissions?assignmentId=${assignmentId}`);
}

export async function getSubmissionsForStudent(studentId) {
  return apiGet(`/api/submissions?studentId=${studentId}`);
}

export async function getSubmission(assignmentId, studentId) {
  const subs = await apiGet(`/api/submissions?assignmentId=${assignmentId}&studentId=${studentId}`);
  return subs[0] || null;
}

export async function submitWork(assignmentId, studentId, file) {
  const form = new FormData();
  form.append('assignmentId', assignmentId);
  form.append('studentId', studentId);
  if (file) form.append('files', file);
  return apiPostForm('/api/submissions', form);
}

export async function gradeSubmission(submissionId, grade, comment) {
  return apiPut(`/api/submissions/${submissionId}/grade`, { grade, comment });
}

export async function returnSubmission(submissionId, grade, comment) {
  return apiPut(`/api/submissions/${submissionId}/return`, { grade, comment });
}

// ═══════════════════════════════════════════════
// ANNOUNCEMENTS (stream)
// ═══════════════════════════════════════════════
export async function getAnnouncements() {
  return apiGet('/api/announcements');
}

export async function createAnnouncement(data, files) {
  if (files && files.length > 0) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v));
    files.forEach(f => form.append('files', f));
    return apiPostForm('/api/announcements', form);
  }
  return apiPost('/api/announcements', data);
}

export async function deleteAnnouncement(id) {
  return apiDelete(`/api/announcements/${id}`);
}

export async function updateAnnouncement(id, data) {
  return apiPut(`/api/announcements/${id}`, data);
}

export async function getAnnouncementComments(announcementId) {
  return apiGet(`/api/announcements/${announcementId}/comments`);
}

export async function addAnnouncementComment(announcementId, data) {
  return apiPost(`/api/announcements/${announcementId}/comments`, data);
}

export function subscribeAnnouncements(callback) {
  let active = true;
  async function poll() {
    if (!active) return;
    try {
      const list = await getAnnouncements();
      if (active) callback(list);
    } catch (e) {
      console.warn('subscribeAnnouncements poll error:', e);
    }
  }
  poll();
  const interval = setInterval(poll, 5000);
  return () => { active = false; clearInterval(interval); };
}

// ═══════════════════════════════════════════════
// SUBMISSION COMMENTS
// ═══════════════════════════════════════════════
export async function getSubmissionComments(submissionId) {
  return apiGet(`/api/comments?submissionId=${submissionId}`);
}

export async function getSubmissionCommentsByAssignment(assignmentId) {
  return apiGet(`/api/comments?assignmentId=${assignmentId}`);
}

export async function addSubmissionComment(data) {
  return apiPost('/api/comments', data);
}

export function subscribeSubmissionComments(submissionId, callback) {
  let active = true;
  async function poll() {
    if (!active) return;
    try {
      const list = await getSubmissionComments(submissionId);
      if (active) callback(list);
    } catch (e) {
      console.warn('subscribeSubmissionComments poll error:', e);
    }
  }
  poll();
  const interval = setInterval(poll, 3000);
  return () => { active = false; clearInterval(interval); };
}

// ═══════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════
export async function getNotifications(userId) {
  return apiGet(`/api/notifications/user/${userId}`);
}

export async function createNotification(userId, type, refId, message) {
  return apiPost('/api/notifications', { userId, type, refId, message });
}

export async function markNotificationRead(notifId) {
  return apiPut(`/api/notifications/${notifId}/read`, {});
}

export async function markAllNotificationsRead(userId) {
  return apiPut(`/api/notifications/user/${userId}/read-all`, {});
}

export function subscribeNotifications(userId, callback) {
  let active = true;
  async function poll() {
    if (!active) return;
    try {
      const list = await getNotifications(userId);
      if (active) callback(list);
    } catch (e) {
      console.warn('subscribeNotifications poll error:', e);
    }
  }
  poll();
  const interval = setInterval(poll, 5000);
  return () => { active = false; clearInterval(interval); };
}

// ═══════════════════════════════════════════════
// FILE UPLOAD HELPERS
// ═══════════════════════════════════════════════
export async function uploadFiles(files) {
  const form = new FormData();
  files.forEach(f => form.append('files', f));
  return apiPostForm('/api/upload', form);
}

/**
 * Формування повного URL для файлу з бекенду.
 */
export function fileUrl(relativePath) {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  return `${BASE_URL}${relativePath}`;
}
