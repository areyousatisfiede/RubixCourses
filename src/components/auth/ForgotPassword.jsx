import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Button, Stack, TextField, Typography, Alert, CircularProgress,
    Paper, Link
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';

const GUN = '#1B242A';
const MOON = '#7EACB5';
const MOON_D = '#5F8F99';
const BANNER = '#2D3748';
const BANNER_D = '#1e2a38';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const validate = () => {
        if (!email.trim()) return 'Будь ласка, введіть email';
        if (!/\S+@\S+\.\S+/.test(email)) return 'Невірний формат email';
        return null;
    };

    async function handleSubmit(e) {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await resetPassword(email);
            setMessage('Інструкції для скидання паролю надіслано на вашу пошту. Перевірте папку "Спам"');
        } catch (e) {
            let message = 'Помилка при спробі скинути пароль. Спробуйте пізніше.';
            if (e.code === 'auth/user-not-found') message = 'Користувача з таким email не знайдено.';
            if (e.code === 'auth/invalid-email') message = 'Невірний формат email.';
            setError(message);
        } finally {
            setLoading(false);
        }
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
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                        <SchoolIcon sx={{ color: MOON, fontSize: 32 }} />
                        <Typography variant="h5" fontWeight={800} sx={{ color: GUN }}>EduHub</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: GUN }}>
                        Відновлення паролю
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#718096', mt: 0.5 }}>
                        Введіть свій email для отримання інструкцій
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

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
                            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Надіслати'}
                        </Button>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Link component={RouterLink} to="/login" sx={{ display: 'flex', alignItems: 'center', color: MOON, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                <ArrowBackIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                Повернутися до входу
                            </Link>
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
}
