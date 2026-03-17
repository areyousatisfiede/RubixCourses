// src/components/HomePage.jsx – EduHub LMS Landing Page

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Chip, Grid, Card, CardContent,
    Container, Stack, Avatar, Divider, LinearProgress,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupsIcon from '@mui/icons-material/Groups';
import KeyIcon from '@mui/icons-material/Key';
import GradeIcon from '@mui/icons-material/Grade';
import ForumIcon from '@mui/icons-material/Forum';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useAuth } from '../context/AuthContext';

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG = '#ffffff';
const BG_LIGHT = '#f7f9fb';
const BANNER = '#2D3748';
const BANNER_D = '#1e2a38';
const GUN = '#1B242A';
const MOON = '#7EACB5';
const MOON_L = '#A8CCD3';
const MOON_D = '#5F8F99';
const MOON_P = 'rgba(126,172,181,0.12)';
const CHAMP = '#F5E4C8';
const CHAMP_A = 'rgba(245,228,200,0.65)';
const BORDER = '#e2e8f0';
const TEXT_SEC = '#4A5568';
const TEXT_MUT = '#A0AEC0';

// ─── Feature cards data ────────────────────────────────────────────────────────
const TEACHER_FEATURES = [
    {
        icon: <KeyIcon sx={{ fontSize: 28 }} />,
        title: 'Код запрошення',
        desc: 'Отримайте унікальний 6-символьний код класу й поділіться ним зі студентами — вони приєднаються в один клік.',
        accent: MOON,
    },
    {
        icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
        title: 'Завдання з дедлайном',
        desc: 'Створюйте завдання з описом, прикріпленнями та датою здачі. Студенти одразу бачать їх у своїй панелі.',
        accent: '#C4A886',
    },
    {
        icon: <GradeIcon sx={{ fontSize: 28 }} />,
        title: 'Оцінювання та коментарі',
        desc: 'Переглядайте роботи, залишайте текстові коментарі та виставляйте оцінки. Студент отримує сповіщення.',
        accent: '#B07FAF',
    },
    {
        icon: <BarChartIcon sx={{ fontSize: 28 }} />,
        title: 'Статистика класу',
        desc: 'Список учасників із прогресом, середньою оцінкою та кількістю зданих робіт — усе в одному місці.',
        accent: MOON_D,
    },
];

const STUDENT_FEATURES = [
    {
        icon: <AutoStoriesIcon sx={{ fontSize: 28 }} />,
        title: 'Список завдань',
        desc: 'Всі завдання впорядковані: прострочені вгорі, здані — позначені. Дедлайни виділені кольором.',
        accent: MOON,
    },
    {
        icon: <CloudUploadIcon sx={{ fontSize: 28 }} />,
        title: 'Здача роботи',
        desc: 'Завантажуйте файли або напишіть відповідь прямо на платформі. Підтверджується зі статусом «Здано ✓».',
        accent: '#48BB78',
    },
    {
        icon: <GradeIcon sx={{ fontSize: 28 }} />,
        title: 'Перегляд оцінок',
        desc: 'Окрема сторінка з усіма оцінками, коментарями вчителя та загальним прогресом по курсу.',
        accent: '#C4A886',
    },
    {
        icon: <ForumIcon sx={{ fontSize: 28 }} />,
        title: 'Стрічка класу',
        desc: 'Оголошення від вчителя, новини класу та можливість залишати коментарі — як в шкільному чаті.',
        accent: '#B07FAF',
    },
];

// ─── Flow step ────────────────────────────────────────────────────────────────
function FlowStep({ number, icon, title, desc, accent, isLast }) {
    return (
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{
                    width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
                    background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
                    border: `1.5px solid ${accent}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: accent,
                }}>
                    {icon}
                </Box>
                {!isLast && (
                    <Box sx={{
                        width: 2, flex: 1, mt: 1, mb: 0,
                        background: `linear-gradient(180deg, ${accent}44, transparent)`,
                        minHeight: 32,
                    }} />
                )}
            </Box>
            <Box pb={isLast ? 0 : 3}>
                <Typography variant="caption" sx={{
                    color: accent, fontWeight: 800, letterSpacing: 1,
                    textTransform: 'uppercase', fontSize: 10,
                }}>
                    Крок {number}
                </Typography>
                <Typography fontWeight={700} sx={{ color: GUN, mt: 0.2, mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ color: TEXT_SEC, lineHeight: 1.65 }}>
                    {desc}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent }) {
    return (
        <Card sx={{
            height: '100%', border: `1px solid ${BORDER}`,
            borderTop: `3px solid ${accent}`,
            transition: 'all 0.22s ease',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 12px 32px ${accent}18`,
                borderColor: `${accent}66`,
            },
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{
                    width: 52, height: 52, borderRadius: 2.5, mb: 2,
                    bgcolor: `${accent}14`, color: accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {icon}
                </Box>
                <Typography fontWeight={700} sx={{ color: GUN, mb: 1 }}>{title}</Typography>
                <Typography variant="body2" sx={{ color: TEXT_SEC, lineHeight: 1.7 }}>{desc}</Typography>
            </CardContent>
        </Card>
    );
}

// ─── Code block mockup ────────────────────────────────────────────────────────
function InviteCodeMockup() {
    return (
        <Box sx={{
            bgcolor: GUN, borderRadius: 4, p: 3,
            border: `1px solid ${MOON}22`,
            boxShadow: '0 16px 48px rgba(27,36,42,0.35)',
        }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <Box sx={{
                    width: 38, height: 38, borderRadius: 2,
                    bgcolor: `${MOON}20`, border: `1.5px solid ${MOON}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <SchoolIcon sx={{ color: MOON, fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                        Математичний аналіз · 2025
                    </Typography>
                    <Typography variant="caption" sx={{ color: `${CHAMP}66` }}>
                        Код для запрошення
                    </Typography>
                </Box>
                <Chip
                    icon={<GroupsIcon sx={{ fontSize: 12 }} />}
                    label="18"
                    size="small"
                    sx={{ ml: 'auto', bgcolor: `${MOON}15`, color: MOON, border: `1px solid ${MOON}33`, fontWeight: 700 }}
                />
            </Stack>

            {/* Code boxes */}
            <Stack direction="row" spacing={0.8} justifyContent="center" mb={0.5}>
                {'MK2025'.split('').map((ch, i) => (
                    <React.Fragment key={i}>
                        {i === 3 && (
                            <Box sx={{ color: `${MOON}44`, fontSize: 18, display: 'flex', alignItems: 'center', px: 0.2 }}>−</Box>
                        )}
                        <Box sx={{
                            width: 40, height: 48, borderRadius: 2,
                            bgcolor: `${MOON}15`, border: `1.5px solid ${MOON}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: '#fff',
                        }}>
                            {ch}
                        </Box>
                    </React.Fragment>
                ))}
            </Stack>
            <Typography variant="caption" sx={{ color: `${CHAMP}44`, display: 'block', textAlign: 'center', mb: 2.5, fontSize: 10 }}>
                Поділіться кодом зі студентами
            </Typography>

            {/* Student list preview */}
            <Divider sx={{ borderColor: `${MOON}18`, mb: 2 }} />
            <Typography variant="caption" sx={{ color: MOON, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: 10, mb: 1.5, display: 'block' }}>
                Учасники · 3
            </Typography>
            {[
                { name: 'Олена Коваленко', grade: 94, color: '#48BB78' },
                { name: 'Михайло Петренко', grade: 78, color: MOON },
                { name: 'Аліна Шевченко', grade: 61, color: '#ED8936' },
            ].map((s) => (
                <Stack key={s.name} direction="row" alignItems="center" justifyContent="space-between"
                    sx={{
                        px: 1.5, py: 0.8, borderRadius: 1.5, mb: 0.5,
                        bgcolor: `${MOON}0A`, border: `1px solid ${MOON}12`,
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, bgcolor: s.color, fontSize: 11, fontWeight: 700 }}>
                            {s.name[0]}
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, fontSize: 12 }}>{s.name}</Typography>
                    </Stack>
                    <Chip label={s.grade} size="small" sx={{
                        bgcolor: `${s.color}20`, color: s.color,
                        fontWeight: 800, border: `1px solid ${s.color}33`, height: 20, fontSize: 11,
                    }} />
                </Stack>
            ))}
        </Box>
    );
}

// ─── Assignment mockup ────────────────────────────────────────────────────────
function AssignmentMockup() {
    return (
        <Box sx={{
            bgcolor: BG, borderRadius: 4, p: 3,
            border: `1px solid ${BORDER}`,
            boxShadow: '0 12px 40px rgba(27,36,42,0.1)',
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography fontWeight={800} sx={{ color: GUN }}>Мої завдання</Typography>
                <Chip label="4 завдання" size="small" sx={{ bgcolor: MOON_P, color: MOON_D, fontWeight: 600 }} />
            </Stack>

            {[
                { title: 'Диференціальні рівняння', deadline: 'Сьогодні', status: 'overdue', border: '#E53E3E', chip: '⚠️ Не здано', chipColor: 'error' },
                { title: 'Теорема Ґріна — доведення', deadline: '14 берез.', status: 'submitted', border: '#48BB78', chip: '✓ Здано', chipColor: 'success' },
                { title: 'Контрольна: ряди Фур\'є', deadline: '18 берез.', status: 'graded', border: MOON, chip: 'Оцінка: 91', chipColor: 'info' },
                { title: 'Реферат: застосування інтегралів', deadline: '22 берез.', status: 'pending', border: MOON_D, chip: 'Не здано', chipColor: 'warning' },
            ].map((a) => (
                <Box key={a.title} sx={{
                    borderLeft: `4px solid ${a.border}`,
                    bgcolor: BG_LIGHT, borderRadius: '0 8px 8px 0',
                    p: 1.5, mb: 1.2,
                    transition: 'all 0.15s',
                    '&:hover': { boxShadow: `2px 2px 12px ${a.border}18` },
                }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography fontWeight={600} sx={{ color: GUN, fontSize: 13 }}>{a.title}</Typography>
                            <Typography variant="caption" sx={{ color: TEXT_MUT }}>Дедлайн: {a.deadline}</Typography>
                        </Box>
                        <Chip label={a.chip} size="small" color={a.chipColor} sx={{ fontSize: '0.68rem', fontWeight: 700 }} />
                    </Stack>
                </Box>
            ))}

            {/* Progress */}
            <Box mt={2} px={0.5}>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" fontWeight={600} sx={{ color: GUN }}>Загальний прогрес</Typography>
                    <Typography variant="caption" sx={{ color: MOON_D, fontWeight: 700 }}>2 / 4</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={50}
                    sx={{ height: 7, borderRadius: 4, bgcolor: MOON_P, '& .MuiLinearProgress-bar': { bgcolor: MOON } }} />
            </Box>
        </Box>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const [activeTab, setActiveTab] = useState('teacher');

    const handleStart = () => {
        if (user) navigate(role === 'teacher' ? '/teacher' : '/student');
        else navigate('/login');
    };

    return (
        <Box>
            {/* ── HERO ──────────────────────────────────────────────────────────── */}
            <Box sx={{
                pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 14 }, px: 2,
                position: 'relative', overflow: 'hidden',
                background: `linear-gradient(140deg, ${BANNER_D} 0%, ${BANNER} 55%, #344055 100%)`,
            }}>
                {/* Glows */}
                <Box sx={{
                    position: 'absolute', top: '-15%', right: '-5%',
                    width: 420, height: 420, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(126,172,181,0.18) 0%, transparent 70%)',
                }} />
                <Box sx={{
                    position: 'absolute', bottom: '-20%', left: '-10%',
                    width: 320, height: 320, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(245,228,200,0.05) 0%, transparent 70%)',
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container alignItems="center" spacing={6}>
                        {/* Left */}
                        <Grid item xs={12} md={6}>
                            <Chip
                                label="✦ Платформа для класної кімнати"
                                sx={{
                                    mb: 3, bgcolor: MOON_P, color: MOON,
                                    border: '1px solid rgba(126,172,181,0.3)', fontWeight: 600,
                                }}
                            />
                            <Typography variant="h2" sx={{
                                color: CHAMP, fontSize: { xs: '2rem', md: '3rem' },
                                lineHeight: 1.2, mb: 2, fontWeight: 900,
                            }}>
                                EduHub — клас{' '}
                                <Box component="span" sx={{ color: MOON }}>у вашому браузері</Box>
                            </Typography>
                            <Typography sx={{ color: CHAMP_A, fontSize: '1.05rem', mb: 4, lineHeight: 1.8 }}>
                                Вчителі створюють клас, видають код — студенти приєднуються. Завдання, здача робіт, оцінки та стрічка оголошень в одному місці.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    variant="contained" size="large"
                                    onClick={handleStart}
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        px: 4, py: 1.5, fontSize: '1rem', fontWeight: 700,
                                        bgcolor: MOON, '&:hover': { bgcolor: MOON_D },
                                        boxShadow: `0 4px 20px ${MOON}44`,
                                    }}
                                >
                                    {user ? 'Перейти до панелі' : 'Почати безкоштовно'}
                                </Button>
                                <Button
                                    variant="outlined" size="large"
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        px: 4, py: 1.5, fontSize: '1rem',
                                        borderColor: 'rgba(245,228,200,0.3)', color: CHAMP,
                                        '&:hover': { borderColor: CHAMP, bgcolor: 'rgba(245,228,200,0.06)' },
                                    }}
                                >
                                    Увійти
                                </Button>
                            </Stack>

                            {/* Trust badges */}
                            <Stack direction="row" spacing={2.5} mt={4} flexWrap="wrap" gap={1}>
                                {[
                                    { icon: <CheckCircleIcon sx={{ fontSize: 15 }} />, label: 'Реєстрація безкоштовна' },
                                    { icon: <CheckCircleIcon sx={{ fontSize: 15 }} />, label: 'Без реклами' },
                                    { icon: <CheckCircleIcon sx={{ fontSize: 15 }} />, label: 'Дані у хмарі' },
                                ].map((b) => (
                                    <Stack key={b.label} direction="row" spacing={0.6} alignItems="center">
                                        <Box sx={{ color: MOON }}>{b.icon}</Box>
                                        <Typography variant="caption" sx={{ color: CHAMP_A }}>{b.label}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>

                        {/* Right — mockup */}
                        <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <InviteCodeMockup />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
            <Box sx={{ bgcolor: BG, borderBottom: `1px solid ${BORDER}`, py: 3.5 }}>
                <Container maxWidth="lg">
                    <Grid container>
                        {[
                            { value: 'Вчитель', label: 'Створює клас та бачить усі здані роботи', icon: <PersonIcon sx={{ fontSize: 18 }} /> },
                            { value: 'Код класу', label: '6-символьний код для приєднання студентів', icon: <KeyIcon sx={{ fontSize: 18 }} /> },
                            { value: 'Студент', label: 'Бачить завдання, здає роботу, отримує оцінку', icon: <SchoolIcon sx={{ fontSize: 18 }} /> },
                            { value: 'Real-time', label: 'Дані оновлюються миттєво через Firestore', icon: <NotificationsActiveIcon sx={{ fontSize: 18 }} /> },
                        ].map((s, i) => (
                            <Grid item xs={6} md={3} key={i}>
                                <Box sx={{
                                    textAlign: 'center', py: 2, px: 1,
                                    borderRight: i < 3 ? `1px solid ${BORDER}` : 'none',
                                }}>
                                    <Stack direction="row" justifyContent="center" spacing={0.5} alignItems="center" mb={0.25}>
                                        <Box sx={{ color: MOON_D }}>{s.icon}</Box>
                                        <Typography variant="h6" fontWeight={800} sx={{ color: MOON_D }}>{s.value}</Typography>
                                    </Stack>
                                    <Typography variant="caption" sx={{ color: TEXT_SEC }}>{s.label}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
            <Box sx={{ bgcolor: BG_LIGHT, py: 9, borderBottom: `1px solid ${BORDER}` }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" mb={6}>
                        <Typography variant="h4" fontWeight={800} sx={{ color: GUN, mb: 1 }}>
                            Як це працює
                        </Typography>
                        <Typography variant="body1" sx={{ color: TEXT_SEC, maxWidth: 520, mx: 'auto' }}>
                            Три прості кроки — від реєстрації до повністю функціонуючого онлайн-класу
                        </Typography>
                    </Box>

                    <Grid container spacing={5} alignItems="center">
                        {/* Steps */}
                        <Grid item xs={12} md={6}>
                            <FlowStep number={1}
                                icon={<PersonIcon fontSize="small" />}
                                title="Вчитель реєструється та створює клас"
                                desc="Після реєстрації як Teacher автоматично генерується унікальний 6-символьний код класу та панель керування."
                                accent={MOON}
                            />
                            <FlowStep number={2}
                                icon={<KeyIcon fontSize="small" />}
                                title="Студенти вводять код і приєднуються"
                                desc='Студент реєструється як Student, натискає «Приєднатись до класу», вводить код — і одразу бачить завдання.'
                                accent="#C4A886"
                            />
                            <FlowStep number={3}
                                icon={<AssignmentIcon fontSize="small" />}
                                title="Завдання, здача та оцінка"
                                desc="Вчитель публікує завдання з дедлайном. Студент заходить, завантажує роботу. Вчитель переглядає, ставить оцінку й коментар."
                                accent="#48BB78"
                                isLast
                            />
                        </Grid>

                        {/* Assignment mockup */}
                        <Grid item xs={12} md={6}>
                            <AssignmentMockup />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ── FEATURES (tabs teacher / student) ─────────────────────────────── */}
            <Box sx={{ bgcolor: BG, py: 9 }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" mb={4}>
                        <Typography variant="h4" fontWeight={800} sx={{ color: GUN, mb: 2 }}>
                            Для кожного своя панель
                        </Typography>

                        {/* Tab switcher */}
                        <Stack direction="row" spacing={0} sx={{
                            display: 'inline-flex', borderRadius: 2,
                            border: `1px solid ${BORDER}`, overflow: 'hidden',
                        }}>
                            {['teacher', 'student'].map((tab) => (
                                <Button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    disableRipple
                                    sx={{
                                        px: 4, py: 1.2, fontWeight: 700, borderRadius: 0,
                                        fontSize: '0.9rem',
                                        bgcolor: activeTab === tab ? GUN : 'transparent',
                                        color: activeTab === tab ? CHAMP : TEXT_SEC,
                                        '&:hover': {
                                            bgcolor: activeTab === tab ? GUN : BG_LIGHT,
                                        },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {tab === 'teacher' ? '👩‍🏫 Вчитель' : '🎓 Студент'}
                                </Button>
                            ))}
                        </Stack>
                    </Box>

                    <Grid container spacing={3}>
                        {(activeTab === 'teacher' ? TEACHER_FEATURES : STUDENT_FEATURES).map((f) => (
                            <Grid item xs={12} sm={6} md={3} key={f.title}>
                                <FeatureCard {...f} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ── CTA ───────────────────────────────────────────────────────────── */}
            <Box sx={{
                py: { xs: 8, md: 11 }, textAlign: 'center', px: 2,
                background: `linear-gradient(135deg, ${BANNER_D} 0%, ${BANNER} 100%)`,
                borderTop: `1px solid rgba(126,172,181,0.15)`,
                position: 'relative', overflow: 'hidden',
            }}>
                <Box sx={{
                    position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
                    width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(126,172,181,0.12) 0%, transparent 65%)',
                }} />
                <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{
                        display: 'inline-block', bgcolor: MOON_P, color: MOON,
                        px: 2.5, py: 0.6, borderRadius: 50, fontSize: '0.8rem', fontWeight: 700, mb: 3,
                        border: '1px solid rgba(126,172,181,0.25)',
                    }}>
                        🚀 Абсолютно безкоштовно
                    </Box>
                    <Typography variant="h4" fontWeight={900} sx={{ color: CHAMP, mb: 1.5, letterSpacing: '-0.02em' }}>
                        Відкрийте свій клас прямо зараз
                    </Typography>
                    <Typography sx={{ color: CHAMP_A, mb: 4.5, fontSize: '1.05rem', lineHeight: 1.75 }}>
                        Реєстрація займає хвилину. Код класу з'являється автоматично — дайте його студентам і починайте.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <Button
                            variant="contained" size="large"
                            onClick={handleStart}
                            sx={{
                                px: 5, py: 1.6, fontSize: '1rem', fontWeight: 700,
                                bgcolor: MOON, '&:hover': { bgcolor: MOON_D },
                                boxShadow: `0 6px 28px ${MOON}44`,
                            }}
                        >
                            Я вчитель — почати →
                        </Button>
                        <Button
                            variant="outlined" size="large"
                            onClick={() => navigate('/login')}
                            sx={{
                                px: 5, py: 1.6, fontSize: '1rem', fontWeight: 700,
                                borderColor: 'rgba(245,228,200,0.3)', color: CHAMP,
                                '&:hover': { borderColor: CHAMP, bgcolor: 'rgba(245,228,200,0.06)' },
                            }}
                        >
                            Я студент — увійти
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* ── FOOTER ────────────────────────────────────────────────────────── */}
            <Box sx={{ bgcolor: BANNER_D, borderTop: '1px solid rgba(126,172,181,0.1)', py: 4, px: 2 }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <SchoolIcon sx={{ color: MOON, fontSize: 20 }} />
                            <Typography fontWeight={800} sx={{ color: CHAMP, fontSize: '1rem' }}>EduHub</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(245,228,200,0.3)' }}>
                                — платформа для класної кімнати
                            </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'rgba(245,228,200,0.2)' }}>
                            © 2026 EduHub. Дипломний проєкт.
                        </Typography>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
