// src/main.jsx – Light MUI theme: white bg, moonstone accent, gunmetal text
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const MOON = '#7EACB5';
const MOON_L = '#A8CCD3';
const MOON_D = '#5F8F99';
const GUN = '#1B242A';
const BANNER = '#2D3748';
const CHAMP = '#F5E4C8';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: MOON,
            light: MOON_L,
            dark: MOON_D,
            contrastText: '#ffffff',
        },
        secondary: {
            main: BANNER,
            light: '#4A5568',
            dark: GUN,
            contrastText: CHAMP,
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        text: {
            primary: GUN,
            secondary: '#4A5568',
            disabled: '#A0AEC0',
        },
        divider: '#e2e8f0',
        action: {
            hover: 'rgba(126,172,181,0.08)',
            selected: 'rgba(126,172,181,0.14)',
        },
        success: { main: '#38A169' },
        error: { main: '#E53E3E' },
        warning: { main: '#D69E2E' },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.03em', color: GUN },
        h2: { fontWeight: 800, letterSpacing: '-0.025em', color: GUN },
        h3: { fontWeight: 700, letterSpacing: '-0.02em', color: GUN },
        h4: { fontWeight: 700, color: GUN },
        h5: { fontWeight: 700, color: GUN },
        h6: { fontWeight: 600, color: GUN },
        button: { fontWeight: 700, textTransform: 'none' },
        body2: { color: '#4A5568' },
        caption: { color: '#718096' },
    },
    shape: { borderRadius: 10 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 700, borderRadius: 8, boxShadow: 'none !important' },
                containedPrimary: {
                    background: MOON,
                    color: '#fff',
                    '&:hover': { background: MOON_D },
                },
                containedSecondary: {
                    background: BANNER,
                    color: CHAMP,
                    '&:hover': { background: GUN },
                },
                outlinedPrimary: {
                    borderColor: MOON,
                    color: MOON_D,
                    '&:hover': { background: 'rgba(126,172,181,0.08)', borderColor: MOON_D },
                },
                textPrimary: {
                    color: MOON_D,
                    '&:hover': { background: 'rgba(126,172,181,0.08)' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
                    borderRadius: 14,
                    transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
                    '&:hover': {
                        boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                        borderColor: MOON_L,
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        background: '#f7f9fb',
                        '& fieldset': { borderColor: '#e2e8f0' },
                        '&:hover fieldset': { borderColor: MOON },
                        '&.Mui-focused fieldset': { borderColor: MOON, borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root': { color: '#718096' },
                    '& .MuiInputLabel-root.Mui-focused': { color: MOON_D },
                    '& .MuiInputBase-input': { color: GUN },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: { background: '#f7f9fb', color: GUN },
                icon: { color: MOON_D },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    '&:hover': { background: 'rgba(126,172,181,0.1)' },
                    '&.Mui-selected': { background: 'rgba(126,172,181,0.15)' },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 6, fontWeight: 600 },
                colorPrimary: { background: 'rgba(126,172,181,0.15)', color: MOON_D },
            },
        },
        MuiDivider: {
            styleOverrides: { root: { borderColor: '#e2e8f0' } },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: '#ffffff',
                    boxShadow: '0 1px 0 #e2e8f0',
                    color: GUN,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: { background: '#ffffff', borderRight: '1px solid #e2e8f0' },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    '&:hover': { background: 'rgba(126,172,181,0.1)' },
                },
            },
        },
        MuiRating: {
            styleOverrides: {
                iconFilled: { color: MOON },
                iconEmpty: { color: '#CBD5E0' },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: { borderRadius: 4, height: 7, background: '#EDF2F7' },
                bar: { background: MOON },
            },
        },
        MuiAlert: {
            styleOverrides: { root: { borderRadius: 8 } },
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
);
