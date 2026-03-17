// src/context/AuthContext.jsx
// Надає { user, role, loading, logout, mockLogin } усьому дереву компонентів

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    signOut, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { Box, CircularProgress } from '@mui/material';
import { auth } from '../firebase/firebase';
import { getUserProfile, createUserProfile } from '../firebase/firestoreHelpers';

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
            try {
                const parsed = JSON.parse(saved);
                setUser(parsed.user);
                setRole(parsed.role);
                setLoading(false); // Демо-акаунт завантажується миттєво
            } catch (e) {
                console.error("Помилка парсингу демо-сесії:", e);
                sessionStorage.removeItem('demo_user');
            }
        }

        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // ВАЖЛИВО: Спершу отримуємо роль, потім знімаємо loading
                try {
                    setUser(firebaseUser);
                    const profile = await getUserProfile(firebaseUser.uid);
                    setRole(profile?.role ?? 'student'); // За замовчуванням student якщо профілю немає
                } catch (e) {
                    console.error("Помилка при отриманні профілю:", e);
                    setRole('student');
                }
            } else {
                // Перевіряємо чи є демо-сесія (якщо немає firebaseUser)
                if (!sessionStorage.getItem('demo_user')) {
                    setUser(null);
                    setRole(null);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    /**
     * Вхід через Firebase Auth
     */
    async function login(email, password) {
        if (!auth) throw new Error('Firebase Auth не ініціалізовано');
        setLoading(true); // Показуємо завантаження поки отримуємо роль
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const profile = await getUserProfile(userCredential.user.uid);
            const userRole = profile?.role || 'student';
            setRole(userRole);
            return { user: userCredential.user, role: userRole };
        } catch (e) {
            setLoading(false);
            throw e;
        }
    }

    /**
     * Реєстрація через Firebase Auth
     */
    async function signup(email, password, role, displayName) {
        if (!auth) throw new Error('Firebase Auth не ініціалізовано');
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName });
            await createUserProfile(userCredential.user.uid, {
                email,
                displayName,
                role,
            });
            setRole(role);
            return { user: userCredential.user, role };
        } catch (e) {
            setLoading(false);
            throw e;
        }
    }

    /**
     * Скидання паролю
     */
    async function resetPassword(email) {
        if (!auth) throw new Error('Firebase Auth не ініціалізовано');
        return await sendPasswordResetEmail(auth, email);
    }

    /**
     * Вхід через тестовий (демо) акаунт — без Firebase.
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

    /**
     * Вихід із системи
     */
    async function logout() {
        if (user?.isDemo) {
            sessionStorage.removeItem('demo_user');
            setUser(null);
            setRole(null);
        } else if (auth) {
            await signOut(auth);
            setUser(null);
            setRole(null);
        }
    }

    const value = {
        user,
        role,
        loading,
        login,
        signup,
        logout,
        resetPassword,
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
