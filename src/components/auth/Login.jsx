// src/components/auth/Login.jsx – includes demo test account buttons
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Button, Divider, Stack, TextField, Typography, Alert, CircularProgress,
    Link, Paper, InputAdornment, IconButton
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth, TEST_ACCOUNTS } from '../../context/AuthContext';
import { auth } from '../../firebase/firebase';

const GUN = '#1B242A';
const MOON = '#7EACB5';
const MOON_D = '#5F8F99';
const BANNER = '#2D3748';
const BANNER_D = '#1e2a38';

const TEACHER_DEMO = TEST_ACCOUNTS.find((a) => a.role === 'teacher');
const STUDENT_DEMO = TEST_ACCOUNTS.find((a) => a.role === 'student');

export default function Login() {
    const navigate = useNavigate();
    const { login, mockLogin } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validate = () => {
        if (!email.trim()) return 'Будь ласка, введіть email';
        if (!/\S+@\S+\.\S+/.test(email)) return 'Невірний формат email';
        if (password.length < 6) return 'Пароль має бути не менше 6 символів';
        return null;
    };

    async function handleEmailSubmit(e) {
        e.preventDefault();
        
        // Спробуємо демо-вхід спочатку
        const demoOk = mockLogin(email, password);
        if (demoOk) {
            const found = TEST_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase());
            navigate(found.role === 'teacher' ? '/teacher' : '/student');
            return;
        }

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        if (!auth) {
            setError('Firebase не налаштовано. Спробуйте демо-акаунт.');
            setLoading(false);
            return;
        }

        try {
            const { role: userRole } = await login(email, password);
            // Перенаправляємо відповідно до ролі
            navigate(userRole === 'teacher' ? '/teacher' : '/student');
        } catch (e) {
            let message = 'Невірний email або пароль.';
            if (e.code === 'auth/user-not-found') message = 'Користувача не знайдено.';
            if (e.code === 'auth/wrong-password') message = 'Невірний пароль.';
            if (e.code === 'auth/invalid-credential') message = 'Невірні дані для входу.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    function loginAsDemo(account) {
        setLoading(true);
        const ok = mockLogin(account.email, account.password);
        if (ok) navigate(account.role === 'teacher' ? '/teacher' : '/student');
        setLoading(false);
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${BANNER_D} 0%, ${BANNER} 55%, #344055 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2, py: 6,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative glow */}
            <Box sx={{
                position: 'absolute', top: '-10%', right: '-5%',
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(126,172,181,0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            
            <Paper
                elevation={0}
                sx={{
                    width: '100%', maxWidth: 480,
                    p: { xs: 3, sm: 5 },
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                }}
            >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                        <SchoolIcon sx={{ color: MOON, fontSize: 32 }} />
                        <Typography variant="h5" fontWeight={800} sx={{ color: GUN }}>EduHub</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: GUN }}>
                        Вхід до платформи
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#718096', mt: 0.5 }}>
                        Введіть свої дані для входу
                    </Typography>
                </Box>

                {/* ── Demo accounts ──────────────────────────────────────────────── */}
                <Box
                    sx={{
                        bgcolor: 'rgba(126,172,181,0.07)',
                        border: '1px solid rgba(126,172,181,0.25)',
                        borderRadius: 2, p: 2, mb: 3,
                    }}
                >
                    <Typography variant="caption" fontWeight={700}
                        sx={{ color: MOON_D, mb: 1.5, display: 'block', letterSpacing: '0.05em' }}>
                        🔑 ДЕМО-АКАУНТИ (без реєстрації)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            startIcon={<SchoolOutlinedIcon />}
                            onClick={() => loginAsDemo(TEACHER_DEMO)}
                            disabled={loading}
                            sx={{
                                flex: 1, minWidth: 130,
                                bgcolor: BANNER, color: '#F5E4C8',
                                fontWeight: 700, py: 1.1,
                                '&:hover': { bgcolor: GUN },
                            }}
                        >
                            Викладач
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PersonIcon />}
                            onClick={() => loginAsDemo(STUDENT_DEMO)}
                            disabled={loading}
                            sx={{
                                flex: 1, minWidth: 130,
                                bgcolor: MOON, color: '#fff',
                                fontWeight: 700, py: 1.1,
                                '&:hover': { bgcolor: MOON_D },
                            }}
                        >
                            Студент
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3, color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600 }}>АБО ЧЕРЕЗ EMAIL</Divider>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleEmailSubmit}>
                    <Stack spacing={2.5}>
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Box>
                            <TextField
                                label="Пароль"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Box sx={{ textAlign: 'right', mt: 1 }}>
                                <Link component={RouterLink} to="/forgot-password" sx={{ fontSize: '0.85rem', color: MOON, fontWeight: 600, textDecoration: 'none' }}>
                                    Забули пароль?
                                </Link>
                            </Box>
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                bgcolor: MOON,
                                fontWeight: 700,
                                fontSize: '1rem',
                                '&:hover': { bgcolor: MOON_D },
                                textTransform: 'none',
                                borderRadius: 2,
                                boxShadow: '0 4px 12px rgba(126,172,181,0.25)',
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Увійти'}
                        </Button>

                        <Typography variant="body2" align="center" sx={{ color: '#718096' }}>
                            Немає акаунту?{' '}
                            <Link component={RouterLink} to="/register" sx={{ color: MOON, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Зареєструватися
                            </Link>
                        </Typography>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
}
