import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Login from './Login';

const navigateMock = vi.fn();
const loginMock = vi.fn();
const mockLoginMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
    mockLogin: mockLoginMock,
  }),
  TEST_ACCOUNTS: [
    { email: 'teacher@eduhub.demo', password: 'demo1234', role: 'teacher' },
    { email: 'student@eduhub.demo', password: 'demo1234', role: 'student' },
  ],
}));

vi.mock('../../firebase/firebase', () => ({
  auth: {},
}));

describe('Login role redirect', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    loginMock.mockReset();
    mockLoginMock.mockReset();
    mockLoginMock.mockReturnValue(false);
  });

  it('redirects teacher to /teacher after email login', async () => {
    loginMock.mockResolvedValue({ role: 'teacher' });
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'teacher@test.com' } });
    fireEvent.change(screen.getByLabelText(/пароль/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Увійти' }));

    await waitFor(() => expect(loginMock).toHaveBeenCalled());
    expect(navigateMock).toHaveBeenCalledWith('/teacher');
  });

  it('redirects student to /student after email login', async () => {
    loginMock.mockResolvedValue({ role: 'student' });
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'student@test.com' } });
    fireEvent.change(screen.getByLabelText(/пароль/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Увійти' }));

    await waitFor(() => expect(loginMock).toHaveBeenCalled());
    expect(navigateMock).toHaveBeenCalledWith('/student');
  });
});
