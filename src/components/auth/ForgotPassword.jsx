import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, Typography, Stack } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const GUN = '#1B242A';
const MOON = '#7EACB5';
const BANNER = '#2D3748';
const BANNER_D = '#1e2a38';

export default function ForgotPassword() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${BANNER_D} 0%, ${BANNER} 55%, #344055 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 6,
            }}
        >
            <Paper elevation={0} sx={{
                width: '100%', maxWidth: 480,
                p: { xs: 3, sm: 5 }, bgcolor: '#fff',
                border: '1px solid #e2e8f0', borderRadius: 3,
            }}>
                <Stack spacing={3} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon sx={{ color: MOON, fontSize: 32 }} />
                        <Typography variant="h5" fontWeight={800} sx={{ color: GUN }}>EduHub</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: GUN, textAlign: 'center' }}>
                        Відновлення паролю
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#718096', textAlign: 'center' }}>
                        Для відновлення паролю зверніться до адміністратора платформи
                        або вашого викладача.
                    </Typography>
                    <Button
                        component={RouterLink} to="/login"
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: MOON, fontWeight: 700 }}
                    >
                        Повернутися до входу
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}
