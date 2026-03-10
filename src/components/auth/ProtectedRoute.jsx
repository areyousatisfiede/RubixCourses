// src/components/auth/ProtectedRoute.jsx
// Захищає маршрут від неавторизованих або неправильних ролей

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * @param {{ allowedRole: 'teacher'|'student', children: React.ReactNode }} props
 */
export default function ProtectedRoute({ allowedRole, children }) {
    const { user, role } = useAuth();

    // Не авторизований — на логін
    if (!user) return <Navigate to="/login" replace />;

    // Неправильна роль — редирект на свій дашборд
    if (role !== allowedRole) {
        const redirect = role === 'teacher' ? '/teacher' : '/student';
        return <Navigate to={redirect} replace />;
    }

    return children;
}
