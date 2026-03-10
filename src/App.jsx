
// src/App.jsx – Routing з публічною головною сторінкою

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/shared/Navbar';
import HomePage from './components/HomePage';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherAssignmentDetail from './components/teacher/AssignmentDetail';
import StudentDashboard from './components/student/StudentDashboard';
import StudentAssignmentDetail from './components/student/AssignmentDetail';
import GradeView from './components/student/GradeView';

export default function App() {
    const { user, role } = useAuth();

    return (
        <>
            <Navbar />

            <Routes>
                {/* Публічна головна сторінка — каталог курсів */}
                <Route path="/" element={<HomePage />} />

                {/* Сторінка входу */}
                <Route
                    path="/login"
                    element={
                        user
                            ? <Navigate to={role === 'teacher' ? '/teacher' : '/student'} replace />
                            : <Login />
                    }
                />

                {/* Захищені маршрути — Викладач */}
                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute allowedRole="teacher">
                            <TeacherDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher/assignment/:id"
                    element={
                        <ProtectedRoute allowedRole="teacher">
                            <TeacherAssignmentDetail />
                        </ProtectedRoute>
                    }
                />

                {/* Захищені маршрути — Студент */}
                <Route
                    path="/student"
                    element={
                        <ProtectedRoute allowedRole="student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/student/assignment/:id"
                    element={
                        <ProtectedRoute allowedRole="student">
                            <StudentAssignmentDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/student/grades"
                    element={
                        <ProtectedRoute allowedRole="student">
                            <GradeView />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}
