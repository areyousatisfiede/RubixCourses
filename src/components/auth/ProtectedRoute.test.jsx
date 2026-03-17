import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';

let authState = { user: null, role: null, loading: false };

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => authState,
}));

function renderProtected(allowedRole = 'teacher') {
  return render(
    <MemoryRouter initialEntries={['/teacher']}>
      <Routes>
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRole={allowedRole}>
              <div>Teacher Page</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/student" element={<div>Student Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('renders children for matching role', () => {
    authState = { user: { uid: '1' }, role: 'teacher', loading: false };
    renderProtected('teacher');
    expect(screen.getByText('Teacher Page')).toBeInTheDocument();
  });

  it('redirects unauthenticated user to login', () => {
    authState = { user: null, role: null, loading: false };
    renderProtected('teacher');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects wrong role to own dashboard', () => {
    authState = { user: { uid: '1' }, role: 'student', loading: false };
    renderProtected('teacher');
    expect(screen.getByText('Student Page')).toBeInTheDocument();
  });
});
