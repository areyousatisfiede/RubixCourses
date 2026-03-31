// src/api/client.js — HTTP-клієнт з JWT авторизацією

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Отримує JWT токен з localStorage та формує заголовки.
 */
function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Універсальний fetch з авторизацією.
 */
async function apiFetch(path, options = {}) {
  const headers = getAuthHeaders();
  // Якщо body є FormData — не ставити Content-Type (browser сам поставить multipart)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function apiGet(path)             { return apiFetch(path); }
export async function apiPost(path, body)      { return apiFetch(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }); }
export async function apiPut(path, body)       { return apiFetch(path, { method: 'PUT',  body: JSON.stringify(body) }); }
export async function apiDelete(path)          { return apiFetch(path, { method: 'DELETE' }); }
export async function apiPostForm(path, form)  { return apiFetch(path, { method: 'POST', body: form }); }
export async function apiPutForm(path, form)   { return apiFetch(path, { method: 'PUT',  body: form }); }

export { BASE_URL };
