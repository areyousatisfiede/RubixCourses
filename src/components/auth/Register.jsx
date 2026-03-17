import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Button, FormControl, InputLabel, MenuItem,
    Select, Stack, TextField, Typography, Alert, CircularProgress,
    Paper, Link, InputAdornment, IconButton
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../context/AuthContext';

const GUN = '#1B242A';
const MOON = '#7EACB5';
const MOON_D = '#5F8F99';
const BANNER = '#2D3748';
const BANNER_D = '#1e2a38';

export default function Register() {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!formData.displayName.trim()) return 'Будь ласка, введіть ваше ім\'я';
        if (!formData.email.trim()) return 'Будь ласка, введіть email';
        if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Невірний формат email';
        if (formData.password.length < 6) return 'Пароль має бути не менше 6 символів';
        if (formData.password !== formData.confirmPassword) return 'Паролі не співпадають';
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

        try {
            await signup(formData.email, formData.password, formData.role, formData.displayName);
            navigate(formData.role === 'teacher' ? '/teacher' : '/student');
        } catch (e) {
            let message = 'Помилка реєстрації. Спробуйте пізніше.';
            if (e.code === 'auth/email-already-in-use') message = 'Цей email вже використовується.';
            if (e.code === 'auth/invalid-email') message = 'Невірний формат email.';
            if (e.code === 'auth/weak-password') message = 'Пароль занадто слабкий.';
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
                        Створити акаунт
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#718096', mt: 0.5 }}>
                        Зареєструйтесь для доступу до курсів
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                        <TextField
                            label="Повне ім'я"
                            name="displayName"
                            variant="outlined"
                            fullWidth
                            value={formData.displayName}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel id="role-label">Я реєструюсь як</InputLabel>
                            <Select
                                labelId="role-label"
                                name="role"
                                value={formData.role}
                                label="Я реєструюсь як"
                                onChange={handleChange}
                            >
                                <MenuItem value="student">Студент</MenuItem>
                                <MenuItem value="teacher">Викладач</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Пароль"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            value={formData.password}
                            onChange={handleChange}
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
                        <TextField
                            label="Підтвердіть пароль"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Зареєструватися'}
                        </Button>

                        <Typography variant="body2" align="center" sx={{ color: '#718096' }}>
                            Вже маєте акаунт?{' '}
                            <Link component={RouterLink} to="/login" sx={{ color: MOON, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Увійти
                            </Link>
                        </Typography>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
}
