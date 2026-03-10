// src/context/AuthContext.jsx
// Надає { user, role, loading, logout, mockLogin } усьому дереву компонентів

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Box, CircularProgress } from '@mui/material';
import { auth } from '../firebase/firebase';
import { getUserProfile } from '../firebase/firestoreHelpers';

const AuthContext = createContext(null);

// ─── Тестові акаунти (без Firebase) ──────────────────────────────────────────
export const TEST_ACCOUNTS = [
    {
        email: 'teacher@eduhub.demo',
        password: 'demo1234',
        role: 'teacher',
        displayName: 'Олена Коваль (Викладач)',
        photoURL: null,
        uid: 'demo-teacher-001',
    },
    {
        email: 'student@eduhub.demo',
        password: 'demo1234',
        role: 'student',
        displayName: 'Михайло Дем\'яненко (Студент)',
        photoURL: null,
        uid: 'demo-student-001',
    },
];

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Відновлюємо демо-сесію з sessionStorage
        const saved = sessionStorage.getItem('demo_user');
        if (saved) {
            const parsed = JSON.parse(saved);
            setUser(parsed.user);
            setRole(parsed.role);
        }

        if (!auth) {
            setLoading(false);
            return;
        }

        const fallbackTimer = setTimeout(() => setLoading(false), 3000);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            clearTimeout(fallbackTimer);
            if (firebaseUser) {
                setUser(firebaseUser);
                const profile = await getUserProfile(firebaseUser.uid);
                setRole(profile?.role ?? null);
            } else {
                // Якщо Firebase повернув null — перевіряємо чи є демо-сесія
                const savedDemo = sessionStorage.getItem('demo_user');
                if (!savedDemo) {
                    setUser(null);
                    setRole(null);
                }
            }
            setLoading(false);
        });

        return () => {
            clearTimeout(fallbackTimer);
            unsubscribe();
        };
    }, []);

    /**
     * Вхід через тестовий (демо) акаунт — без Firebase.
     * Повертає true якщо email/password співпадає з тестовим акаунтом.
     */
    function mockLogin(email, password) {
        const found = TEST_ACCOUNTS.find(
            (a) => a.email === email.trim().toLowerCase() && a.password === password
        );
        if (!found) return false;

        const mockUser = {
            uid: found.uid,
            email: found.email,
            displayName: found.displayName,
            photoURL: found.photoURL,
            isDemo: true,
        };
        setUser(mockUser);
        setRole(found.role);
        sessionStorage.setItem('demo_user', JSON.stringify({ user: mockUser, role: found.role }));
        return true;
    }

    async function logout() {
        sessionStorage.removeItem('demo_user');
        if (auth && user && !user.isDemo) {
            await signOut(auth);
        }
        setUser(null);
        setRole(null);
    }

    const value = { user, role, loading, logout, mockLogin };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f7f9fb',
                }}
            >
                <CircularProgress sx={{ color: '#7EACB5' }} size={48} />
            </Box>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
