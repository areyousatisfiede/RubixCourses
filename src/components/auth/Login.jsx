// src/components/auth/Login.jsx – includes demo test account buttons
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase/firebase';
import { getUserProfile, createUserProfile } from '../../firebase/firestoreHelpers';
import {
    Box, Button, Divider, FormControl, InputLabel, MenuItem,
    Select, Stack, TextField, Typography, Alert, CircularProgress,
    Link, Paper,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { useAuth, TEST_ACCOUNTS } from '../../context/AuthContext';

const GUN = '#1B242A';
const MOON = '#7EACB5';
const MOON_D = '#5F8F99';
const BANNER = '#2D3748';

const TEACHER_DEMO = TEST_ACCOUNTS.find((a) => a.role === 'teacher');
const STUDENT_DEMO = TEST_ACCOUNTS.find((a) => a.role === 'student');

export default function Login() {
    const navigate = useNavigate();
    const { mockLogin } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('student');
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handlePostLogin(firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        let role = profile?.role;
        if (!profile) {
            await createUserProfile(firebaseUser.uid, {
                displayName: firebaseUser.displayName || email.split('@')[0],
                email: firebaseUser.email,
                role: selectedRole,
            });
            role = selectedRole;
        }
        navigate(role === 'teacher' ? '/teacher' : '/student');
    }

    async function handleGoogle() {
        if (!auth) { setError('Firebase не налаштовано'); return; }
        setLoading(true); setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await handlePostLogin(result.user);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }

    async function handleEmailSubmit(e) {
        e.preventDefault();
        setLoading(true); setError('');

        // Спробуємо демо-вхід спочатку
        const demoOk = mockLogin(email, password);
        if (demoOk) {
            const found = TEST_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase());
            setLoading(false);
            navigate(found.role === 'teacher' ? '/teacher' : '/student');
            return;
        }

        if (!auth) {
            setError('Firebase не налаштовано. Спробуйте демо-акаунт нижче.');
            setLoading(false);
            return;
        }

        try {
            const result = isRegister
                ? await createUserWithEmailAndPassword(auth, email, password)
                : await signInWithEmailAndPassword(auth, email, password);
            await handlePostLogin(result.user);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }

    function fillDemo(account) {
        setEmail(account.email);
        setPassword(account.password);
        setError('');
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
                bgcolor: '#f7f9fb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2, py: 6,
            }}
        >
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
                        {isRegister ? 'Створити акаунт' : 'Вхід до платформи'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#718096', mt: 0.5 }}>
                        {isRegister ? 'Зареєструйтесь для доступу до курсів' : 'Введіть свої дані для входу'}
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
                        {/* Teacher demo */}
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
                        {/* Student demo */}
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
                    <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                            👨‍🏫 <b style={{ color: GUN }}>{TEACHER_DEMO.email}</b> / {TEACHER_DEMO.password}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                            🎓 <b style={{ color: GUN }}>{STUDENT_DEMO.email}</b> / {STUDENT_DEMO.password}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: '#A0AEC0', px: 1 }}>або власний акаунт</Typography>
                </Divider>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {!auth && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Firebase не підключено — використовуйте демо-акаунти вище.
                    </Alert>
                )}

                {/* Role */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: '#718096' }}>Роль</InputLabel>
                    <Select value={selectedRole} label="Роль" onChange={(e) => setSelectedRole(e.target.value)}
                        sx={{ color: GUN }}>
                        <MenuItem value="student">🎓 Студент</MenuItem>
                        <MenuItem value="teacher">👨‍🏫 Викладач</MenuItem>
                    </Select>
                </FormControl>

                {/* Google */}
                <Button
                    fullWidth variant="outlined" startIcon={<GoogleIcon />}
                    onClick={handleGoogle} disabled={loading}
                    sx={{
                        py: 1.3, mb: 2,
                        borderColor: '#e2e8f0', color: GUN,
                        '&:hover': { borderColor: MOON, bgcolor: 'rgba(126,172,181,0.06)' },
                    }}
                >
                    Увійти через Google
                </Button>

                <Divider sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#A0AEC0', px: 1 }}>або</Typography>
                </Divider>

                <Box component="form" onSubmit={handleEmailSubmit}>
                    <Stack spacing={2}>
                        <TextField label="Email" type="email" fullWidth required
                            value={email} onChange={(e) => setEmail(e.target.value)} />
                        <TextField label="Пароль" type="password" fullWidth required
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}
                            sx={{ py: 1.4 }}>
                            {loading
                                ? <CircularProgress size={20} sx={{ color: '#fff' }} />
                                : isRegister ? 'Зареєструватися' : 'Увійти'}
                        </Button>
                    </Stack>
                </Box>

                <Box textAlign="center" mt={3}>
                    <Typography variant="body2" sx={{ color: '#718096' }}>
                        {isRegister ? 'Вже є акаунт? ' : 'Немає акаунту? '}
                        <Link component="button" fontWeight={700} sx={{ color: MOON_D, cursor: 'pointer' }}
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                            {isRegister ? 'Увійти' : 'Зареєструватися'}
                        </Link>
                    </Typography>
                </Box>

                <Box textAlign="center" mt={1.5}>
                    <Link component={RouterLink} to="/" variant="body2"
                        sx={{ color: '#A0AEC0', '&:hover': { color: MOON_D } }}>
                        ← Повернутися до курсів
                    </Link>
                </Box>
            </Paper>
        </Box>
    );
}
