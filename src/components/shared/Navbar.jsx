// src/components/shared/Navbar.jsx – White navbar, moonstone accent, gunmetal text
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, Avatar,
    Box, Chip, IconButton, Drawer, List, ListItem, ListItemButton,
    ListItemText, Divider, useMediaQuery, useTheme, InputBase,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../context/AuthContext';

const GUN = '#1B242A';
const MOON = '#7EACB5';
const MOON_D = '#5F8F99';

export default function Navbar() {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);

    async function handleLogout() {
        await logout();
        navigate('/');
    }

    const dashboardLink = role === 'teacher' ? '/teacher' : '/student';

    return (
        <>
            <AppBar position="sticky" elevation={0}>
                <Toolbar sx={{ minHeight: 64, gap: 1, px: { xs: 2, md: 3 } }}>
                    {/* Logo */}
                    <Box
                        component={RouterLink} to="/"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, textDecoration: 'none', mr: 2, flexShrink: 0 }}
                    >
                        <SchoolIcon sx={{ color: MOON, fontSize: 26 }} />
                        <Typography sx={{ color: GUN, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
                            EduHub
                        </Typography>
                    </Box>

                    {/* Search (desktop) */}
                    {!isMobile && (
                        <Box
                            sx={{
                                display: 'flex', alignItems: 'center',
                                bgcolor: '#f7f9fb',
                                border: '1px solid #e2e8f0',
                                borderRadius: 50,
                                px: 1.75, py: 0.5,
                                minWidth: 200, maxWidth: 320, flex: 1, mx: 2,
                                '&:focus-within': { borderColor: MOON, bgcolor: '#fff' },
                            }}
                        >
                            <SearchIcon sx={{ color: MOON, fontSize: 17, mr: 0.75 }} />
                            <InputBase
                                placeholder="Пошук курсів..."
                                sx={{
                                    fontSize: '0.85rem', color: GUN, width: '100%',
                                    '& input::placeholder': { color: '#A0AEC0' },
                                }}
                            />
                        </Box>
                    )}

                    {/* Nav links */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Button
                                component={RouterLink} to="/" size="small"
                                sx={{ color: '#4A5568', fontWeight: 600, '&:hover': { color: GUN, bgcolor: '#f7f9fb' } }}
                            >
                                Курси
                            </Button>
                            {user && (
                                <Button
                                    component={RouterLink} to={dashboardLink} size="small"
                                    sx={{ color: '#4A5568', fontWeight: 600, '&:hover': { color: GUN, bgcolor: '#f7f9fb' } }}
                                >
                                    {role === 'teacher' ? 'Дашборд' : 'Мої курси'}
                                </Button>
                            )}
                            {user && role === 'student' && (
                                <Button
                                    component={RouterLink} to="/student/grades" size="small"
                                    sx={{ color: '#4A5568', fontWeight: 600, '&:hover': { color: GUN, bgcolor: '#f7f9fb' } }}
                                >
                                    Оцінки
                                </Button>
                            )}
                        </Box>
                    )}

                    <Box flex={1} />

                    {!isMobile && (
                        <>
                            {user ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Chip
                                        label={role === 'teacher' ? 'Викладач' : 'Студент'}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(126,172,181,0.13)', color: MOON_D, fontWeight: 600 }}
                                    />
                                    <Avatar
                                        src={user.photoURL}
                                        sx={{ width: 34, height: 34, bgcolor: MOON, color: '#fff', fontSize: 13, fontWeight: 700 }}
                                    >
                                        {!user.photoURL && (user.displayName || user.email || '?')[0].toUpperCase()}
                                    </Avatar>
                                    <IconButton
                                        size="small" onClick={handleLogout} title="Вийти"
                                        sx={{ color: '#A0AEC0', '&:hover': { color: GUN, bgcolor: '#f7f9fb' } }}
                                    >
                                        <LogoutIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Button
                                        component={RouterLink} to="/login" size="small" variant="outlined" color="primary"
                                        sx={{ px: 2.5, fontWeight: 700 }}
                                    >
                                        Увійти
                                    </Button>
                                    <Button
                                        component={RouterLink} to="/login" size="small" variant="contained" color="primary"
                                        sx={{ px: 2.5, fontWeight: 700 }}
                                    >
                                        Реєстрація
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}

                    {isMobile && (
                        <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: GUN }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box p={2.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ color: MOON }} />
                    <Typography fontWeight={800} color={GUN} fontSize="1.1rem">EduHub</Typography>
                </Box>
                <Divider />
                <List sx={{ px: 1 }}>
                    {[
                        { label: 'Курси', to: '/' },
                        ...(user ? [{ label: role === 'teacher' ? 'Дашборд' : 'Мої курси', to: dashboardLink }] : []),
                        ...(user && role === 'student' ? [{ label: 'Оцінки', to: '/student/grades' }] : []),
                        ...(!user ? [{ label: 'Увійти', to: '/login' }, { label: 'Реєстрація', to: '/login' }] : []),
                    ].map((item) => (
                        <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton component={RouterLink} to={item.to} onClick={() => setDrawerOpen(false)}>
                                <ListItemText primary={item.label} primaryTypographyProps={{ color: GUN, fontWeight: 600 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {user && (
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemText primary="Вийти" primaryTypographyProps={{ color: '#A0AEC0' }} />
                            </ListItemButton>
                        </ListItem>
                    )}
                </List>
            </Drawer>
        </>
    );
}
