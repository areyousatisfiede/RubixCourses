// src/context/AuthContext.jsx
// Надає { user, role, loading, logout, login, signup } усьому дереву компонентів
// Авторизація через MongoDB + JWT (без Firebase Auth)

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { apiPost, apiGet } from '../api/client';

const AuthContext = createContext(null);

// ─── Тестові акаунти ──────────────────────────────────────────
export const TEST_ACCOUNTS = [
    {
        email: 'teacher@eduhub.demo',
        password: 'demo1234',
        role: 'teacher',
        displayName: 'Олена Коваль (Викладач)',
    },
    {
        email: 'student@eduhub.demo',
        password: 'demo1234',
        role: 'student',
        displayName: 'Михайло Дем\'яненко (Студент)',
    },
];

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // При завантаженні — перевіряємо збережений токен
    useEffect(() => {
        async function restoreSession() {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const userData = await apiGet('/api/auth/me');
                setUser(userData);
                setRole(userData.role);
            } catch (e) {
                // Токен невалідний — очищаємо
                console.warn('Session restore failed:', e);
                localStorage.removeItem('token');
            }
            setLoading(false);
        }
        restoreSession();
    }, []);

    /**
     * Вхід через MongoDB
     */
    async function login(email, password) {
        const data = await apiPost('/api/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setRole(data.user.role);
        return { user: data.user, role: data.user.role };
    }

    /**
     * Реєстрація через MongoDB
     */
    async function signup(email, password, role, displayName) {
        const data = await apiPost('/api/auth/register', { email, password, role, displayName });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setRole(data.user.role);
        return { user: data.user, role: data.user.role };
    }

    /**
     * Швидкий вхід через демо-акаунт (реєструє якщо ще не існує, або входить)
     */
    async function mockLogin(email, password) {
        const found = TEST_ACCOUNTS.find(
            (a) => a.email === email.trim().toLowerCase() && a.password === password
        );
        if (!found) return false;

        try {
            // Спершу спробуємо війти
            await login(found.email, found.password);
            return true;
        } catch (e) {
            // Якщо не знайдено — реєструємо
            try {
                await signup(found.email, found.password, found.role, found.displayName);
                return true;
            } catch (e2) {
                console.error('Demo login failed:', e2);
                return false;
            }
        }
    }

    /**
     * Вихід із системи
     */
    function logout() {
        localStorage.removeItem('token');
        setUser(null);
        setRole(null);
    }

    const value = {
        user,
        role,
        loading,
        login,
        signup,
        logout,
        mockLogin,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}
