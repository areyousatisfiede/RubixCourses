// src/components/student/JoinClassModal.jsx
// Модальне вікно для введення коду запрошення

import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Button, CircularProgress, Dialog, DialogContent,
    IconButton, Stack, Typography, Zoom,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getClassByCode, joinClass, createNotification } from '../../firebase/firestoreHelpers';

const MOON = '#7EACB5';
const MOON_D = '#5F8F99';
const GUN = '#1B242A';
const BANNER = '#C4D9E3';

const CODE_LEN = 6;

export default function JoinClassModal({ open, onClose, studentId, onJoined }) {
    const [digits, setDigits] = useState(Array(CODE_LEN).fill(''));
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');
    const [joinedClass, setJoinedClass] = useState(null);
    const refs = useRef([]);

    useEffect(() => {
        if (open) {
            setDigits(Array(CODE_LEN).fill(''));
            setStatus('idle');
            setErrorMsg('');
            setJoinedClass(null);
            // Автофокус на перший символ
            setTimeout(() => refs.current[0]?.focus(), 120);
        }
    }, [open]);

    function handleChange(idx, value) {
        const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!upper) {
            // Backspace: очищаємо і переходимо назад
            const next = [...digits];
            next[idx] = '';
            setDigits(next);
            if (idx > 0) refs.current[idx - 1]?.focus();
            return;
        }
        const char = upper[upper.length - 1]; // тільки останній символ
        const next = [...digits];
        next[idx] = char;
        setDigits(next);
        if (idx < CODE_LEN - 1) refs.current[idx + 1]?.focus();
    }

    function handleKeyDown(idx, e) {
        if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
        if (e.key === 'Enter') handleJoin();
    }

    // Вставка цілого коду (Ctrl+V)
    function handlePaste(e) {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const next = Array(CODE_LEN).fill('');
        for (let i = 0; i < Math.min(CODE_LEN, pasted.length); i++) next[i] = pasted[i];
        setDigits(next);
        refs.current[Math.min(CODE_LEN - 1, pasted.length)]?.focus();
    }

    async function handleJoin() {
        const code = digits.join('');
        if (code.length < CODE_LEN) { setErrorMsg('Введіть повний 6-символьний код'); setStatus('error'); return; }
        setStatus('loading');
        setErrorMsg('');
        try {
            const cls = await getClassByCode(code);
            if (!cls) {
                setErrorMsg('Клас з таким кодом не знайдено. Перевірте та спробуйте ще раз.');
                setStatus('error');
                return;
            }
            if (cls.studentIds?.includes(studentId)) {
                setErrorMsg('Ви вже є учасником цього класу!');
                setStatus('error');
                return;
            }
            await joinClass(cls.id, studentId);
            // Сповіщуємо вчителя
            await createNotification(
                cls.teacherId,
                'system',
                cls.id,
                `Новий студент приєднався до класу «${cls.name}»`
            );
            setJoinedClass(cls);
            setStatus('success');
        } catch (e) {
            setErrorMsg('Помилка підключення. Спробуйте ще раз.');
            setStatus('error');
        }
    }

    const code = digits.join('');
    const allFilled = code.length === CODE_LEN;

    return (
        <Dialog
            open={open}
            onClose={status !== 'loading' ? onClose : undefined}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    background: `linear-gradient(160deg, ${GUN} 0%, #263340 100%)`,
                    color: '#fff',
                    overflow: 'hidden',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                },
            }}
        >
            {/* Декоративний акцент */}
            <Box sx={{
                height: 4,
                background: `linear-gradient(90deg, ${MOON}, ${BANNER})`,
            }} />

            <DialogContent sx={{ pt: 3, pb: 4, px: 4 }}>
                {/* Кнопка закриття */}
                {status !== 'loading' && (
                    <IconButton onClick={onClose} sx={{
                        position: 'absolute', top: 12, right: 12,
                        color: BANNER, '&:hover': { bgcolor: `${MOON}22` },
                    }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}

                {/* Успіх */}
                {status === 'success' && (
                    <Zoom in>
                        <Stack alignItems="center" spacing={2} py={2}>
                            <CheckCircleIcon sx={{ fontSize: 64, color: '#48BB78' }} />
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', textAlign: 'center' }}>
                                Вітаємо у класі!
                            </Typography>
                            <Typography variant="body2" sx={{ color: BANNER, textAlign: 'center' }}>
                                Ви успішно приєднались до класу
                            </Typography>
                            <Typography variant="h6" sx={{ color: MOON, fontWeight: 700 }}>
                                «{joinedClass?.name}»
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => { onJoined?.(joinedClass); onClose(); }}
                                sx={{
                                    mt: 1, bgcolor: MOON, color: '#fff', fontWeight: 700,
                                    borderRadius: 2, px: 4, '&:hover': { bgcolor: MOON_D },
                                }}
                            >
                                Чудово!
                            </Button>
                        </Stack>
                    </Zoom>
                )}

                {/* Форма вводу коду */}
                {status !== 'success' && (
                    <Stack alignItems="center" spacing={3}>
                        {/* Іконка */}
                        <Box sx={{
                            width: 60, height: 60, borderRadius: 3,
                            bgcolor: `${MOON}18`, border: `2px solid ${MOON}33`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Typography sx={{ fontSize: 28 }}>🏫</Typography>
                        </Box>

                        <Box textAlign="center">
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
                                Приєднатись до класу
                            </Typography>
                            <Typography variant="body2" sx={{ color: BANNER, mt: 0.5 }}>
                                Введіть 6-символьний код від вчителя
                            </Typography>
                        </Box>

                        {/* Поля введення символів */}
                        <Stack direction="row" alignItems="center" spacing={0.7} onPaste={handlePaste}>
                            {digits.map((d, idx) => (
                                <React.Fragment key={idx}>
                                    {/* Separator dash between char 3 and 4 */}
                                    {idx === 3 && (
                                        <Box sx={{
                                            color: `${MOON}55`, fontSize: 20, fontWeight: 300,
                                            px: 0.3, userSelect: 'none',
                                        }}>−</Box>
                                    )}
                                    <Box
                                        component="input"
                                        ref={(el) => (refs.current[idx] = el)}
                                        value={d}
                                        onChange={(e) => handleChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        maxLength={2}
                                        disabled={status === 'loading'}
                                        sx={{
                                            width: 42, height: 52,
                                            borderRadius: 2,
                                            border: `2px solid ${status === 'error' && !d ? '#E53E3E66'
                                                    : d ? MOON
                                                        : `${MOON}2A`
                                                }`,
                                            bgcolor: d ? `${MOON}20` : `${MOON}0A`,
                                            color: '#fff',
                                            fontSize: 21, fontWeight: 800,
                                            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                            textAlign: 'center',
                                            outline: 'none',
                                            cursor: 'text',
                                            transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                                            '@keyframes focusPulse': {
                                                '0%': { boxShadow: `0 0 0 0px ${MOON}33` },
                                                '70%': { boxShadow: `0 0 0 5px ${MOON}00` },
                                                '100%': { boxShadow: `0 0 0 0px ${MOON}00` },
                                            },
                                            '&:focus': {
                                                border: `2px solid ${MOON}`,
                                                bgcolor: `${MOON}25`,
                                                animation: 'focusPulse 1.2s ease infinite',
                                            },
                                            '&:disabled': { opacity: 0.4 },
                                        }}
                                    />
                                </React.Fragment>
                            ))}
                        </Stack>

                        {/* Помилка */}
                        {status === 'error' && (
                            <Stack direction="row" spacing={1} alignItems="center"
                                sx={{ bgcolor: '#E53E3E18', border: '1px solid #E53E3E44', borderRadius: 2, px: 2, py: 1 }}>
                                <ErrorOutlineIcon sx={{ fontSize: 16, color: '#E53E3E' }} />
                                <Typography variant="caption" sx={{ color: '#FC8181' }}>
                                    {errorMsg}
                                </Typography>
                            </Stack>
                        )}

                        {/* Кнопка */}
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={!allFilled || status === 'loading'}
                            onClick={handleJoin}
                            sx={{
                                bgcolor: allFilled ? MOON : `${MOON}44`,
                                color: '#fff', fontWeight: 700,
                                borderRadius: 2, py: 1.5,
                                fontSize: 15,
                                '&:hover': { bgcolor: MOON_D },
                                transition: 'all 0.2s',
                            }}
                        >
                            {status === 'loading' ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Приєднатись →'}
                        </Button>

                        <Typography variant="caption" sx={{ color: BANNER, opacity: 0.7 }}>
                            Запитайте код у вашого вчителя
                        </Typography>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
