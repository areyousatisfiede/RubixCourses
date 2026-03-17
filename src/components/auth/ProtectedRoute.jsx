// src/components/auth/ProtectedRoute.jsx
// Захищає маршрут від неавторизованих або неправильних ролей

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * @param {{ allowedRole?: 'teacher'|'student', anyRole?: boolean, children: React.ReactNode }} props
 * anyRole=true  →  будь-який авторизований користувач
 * allowedRole   →  лише з конкретною роллю
 */
export default function ProtectedRoute({ allowedRole, anyRole, children }) {
    const { user, role, loading } = useAuth();

    // Якщо все ще завантажується — показуємо спінер (хоча AuthProvider вже має свій)
    if (loading) return null;

    // Не авторизований — на логін
    if (!user) return <Navigate to="/login" replace />;

    // Будь-яка роль дозволена (напр. /stream)
    if (anyRole) return children;

    // Якщо роль ще не визначена (напр. Firestore повільний) — чекаємо
    if (role === null) return null;

    // Неправильна роль — редирект на свій дашборд
    if (role !== allowedRole) {
        const redirect = role === 'teacher' ? '/teacher' : '/student';
        return <Navigate to={redirect} replace />;
    }

    return children;
}
