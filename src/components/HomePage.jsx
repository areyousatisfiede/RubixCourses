// src/components/HomePage.jsx – White bg, charcoal #2D3748 banners, moonstone accent

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Chip, Grid, Card, CardContent,
    InputBase, Rating, Container, Divider, LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import BrushIcon from '@mui/icons-material/Brush';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '../context/AuthContext';

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG = '#ffffff';
const BG_LIGHT = '#f7f9fb';
const BANNER = '#2D3748';   // lighter dark for hero / banners
const BANNER_D = '#1e2a38';   // footer / deeper sections
const GUN = '#1B242A';   // dark text on white
const MOON = '#7EACB5';
const MOON_L = '#A8CCD3';
const MOON_D = '#5F8F99';
const MOON_P = 'rgba(126,172,181,0.12)';
const CHAMP = '#F5E4C8';   // text on dark banners
const CHAMP_A = 'rgba(245,228,200,0.68)';
const BORDER = '#e2e8f0';
const TEXT_SEC = '#4A5568';
const TEXT_MUT = '#A0AEC0';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    { label: 'Data Science', icon: <TrendingUpIcon />, accent: MOON },
    { label: 'Бізнес', icon: <BusinessCenterIcon />, accent: '#C4A886' },
    { label: 'Computer Science', icon: <CodeIcon />, accent: MOON_D },
    { label: 'Дизайн', icon: <BrushIcon />, accent: '#B07FAF' },
    { label: 'ШІ та ML', icon: <PsychologyIcon />, accent: MOON },
    { label: 'Бухгалтерія', icon: <AccountBalanceIcon />, accent: '#C4A886' },
    { label: 'Саморозвиток', icon: <EmojiObjectsIcon />, accent: '#D4856A' },
    { label: 'Мови', icon: <SchoolIcon />, accent: MOON_L },
];

const COURSES = [
    {
        id: 1, title: 'Python для всіх: основи програмування',
        instructor: 'Олена Коваль', institution: 'Університет Мічиган', instInitial: 'U',
        students: 3_200_000, rating: 4.8, reviews: 147_320, duration: '2 місяці',
        tags: ['Python', 'Програмування'], badge: 'Хіт', emoji: '🐍',
        accent: MOON, skills: ['Python Syntax', 'Data Structures'], type: 'Спеціалізація',
    },
    {
        id: 2, title: 'Machine Learning Спеціалізація',
        instructor: 'Ендрю Нг', institution: 'DeepLearning.AI', instInitial: 'D',
        students: 1_800_000, rating: 4.9, reviews: 98_540, duration: '3 місяці',
        tags: ['ML', 'Python', 'ШІ'], badge: 'Топ курс', emoji: '🤖',
        accent: '#C4A886', skills: ['Supervised Learning', 'Neural Nets'], type: 'Спеціалізація',
    },
    {
        id: 3, title: 'UI/UX Дизайн: від ідеї до прототипу',
        instructor: 'Максим Левченко', institution: 'Google', instInitial: 'G',
        students: 890_000, rating: 4.8, reviews: 54_210, duration: '6 місяців',
        tags: ['Дизайн', 'UX', 'Figma'], badge: '', emoji: '🎨',
        accent: MOON_L, skills: ['User Research', 'Prototyping'], type: 'Сертифікат',
    },
    {
        id: 4, title: 'Веб-розробка: React та Node.js',
        instructor: 'Вікторія Полтавська', institution: 'Meta', instInitial: 'M',
        students: 1_200_000, rating: 4.7, reviews: 72_830, duration: '5 місяців',
        tags: ['React', 'JavaScript'], badge: 'Новий', emoji: '⚛️',
        accent: MOON, skills: ['React Hooks', 'REST APIs'], type: 'Сертифікат',
    },
    {
        id: 5, title: 'Основи менеджменту проектів',
        instructor: 'Дмитро Гнатенко', institution: 'Google', instInitial: 'G',
        students: 670_000, rating: 4.6, reviews: 38_400, duration: '6 місяців',
        tags: ['Бізнес', 'Agile'], badge: '', emoji: '📋',
        accent: '#C4A886', skills: ['Agile', 'Risk Management'], type: 'Сертифікат',
    },
    {
        id: 6, title: 'SQL та аналітика даних',
        instructor: 'Наталія Шевченко', institution: 'IBM', instInitial: 'I',
        students: 540_000, rating: 4.7, reviews: 29_100, duration: '2 місяці',
        tags: ['SQL', 'Analytics'], badge: '', emoji: '🗄️',
        accent: MOON_L, skills: ['SQL Queries', 'Data Analysis'], type: 'Курс',
    },
];

const STATS = [
    { value: '12 000+', label: 'Студентів' },
    { value: '620+', label: 'Курсів' },
    { value: '98%', label: 'Задоволені' },
    { value: '4.8★', label: 'Середня оцінка' },
];

const PARTNERS = ['Google', 'Meta', 'IBM', 'Stanford', 'DeepMind', 'Microsoft'];

function fmt(n) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return n;
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course }) {
    const navigate = useNavigate();
    return (
        <Card onClick={() => navigate('/login')} sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Thumbnail */}
            <Box
                sx={{
                    height: 128, bgcolor: `${course.accent}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.8rem', position: 'relative', borderBottom: `1px solid ${BORDER}`,
                }}
            >
                {course.emoji}
                {course.badge && (
                    <Chip label={course.badge} size="small" sx={{
                        position: 'absolute', top: 10, left: 10,
                        bgcolor: MOON, color: '#fff', fontWeight: 700, fontSize: '0.68rem', height: 22, borderRadius: 1,
                    }} />
                )}
                <Chip label={course.type} size="small" sx={{
                    position: 'absolute', top: 10, right: 10,
                    bgcolor: 'rgba(45,55,72,0.07)', color: TEXT_SEC,
                    fontSize: '0.68rem', height: 22, border: `1px solid ${BORDER}`, borderRadius: 1,
                }} />
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                {/* Institution */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                    <Box sx={{
                        width: 20, height: 20, borderRadius: '50%',
                        bgcolor: `${course.accent}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6rem', color: course.accent, fontWeight: 700,
                    }}>
                        {course.instInitial}
                    </Box>
                    <Typography variant="caption" sx={{ color: TEXT_SEC, fontWeight: 600 }}>{course.institution}</Typography>
                </Box>

                <Typography variant="subtitle2" fontWeight={700} lineHeight={1.45} mb={0.75}
                    sx={{ fontSize: '0.9rem', color: GUN }}>
                    {course.title}
                </Typography>
                <Typography variant="caption" sx={{ color: TEXT_MUT, display: 'block', mb: 1.25 }}>
                    {course.instructor}
                </Typography>

                {/* Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.25 }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color: MOON_D, fontSize: '0.85rem' }}>
                        {course.rating}
                    </Typography>
                    <Rating value={course.rating} precision={0.1} readOnly size="small" sx={{ fontSize: '0.85rem' }} />
                    <Typography variant="caption" sx={{ color: TEXT_MUT }}>({fmt(course.reviews)})</Typography>
                </Box>

                {/* Skills */}
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                    {course.skills.map((s) => (
                        <Chip key={s} label={s} size="small"
                            sx={{ height: 22, fontSize: '0.7rem', bgcolor: MOON_P, color: MOON_D, border: 'none' }} />
                    ))}
                </Box>

                {/* Meta */}
                <Box sx={{ display: 'flex', gap: 2, pt: 1.5, borderTop: `1px solid ${BORDER}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <PeopleIcon sx={{ fontSize: 14, color: TEXT_MUT }} />
                        <Typography variant="caption" sx={{ color: TEXT_SEC }}>{fmt(course.students)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: TEXT_MUT }} />
                        <Typography variant="caption" sx={{ color: TEXT_SEC }}>{course.duration}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <VerifiedIcon sx={{ fontSize: 14, color: MOON }} />
                        <Typography variant="caption" sx={{ color: MOON_D, fontWeight: 600 }}>Сертифікат</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('');
    const navigate = useNavigate();

    const filtered = COURSES.filter((c) => {
        const ms = !search ||
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
        const mc = !activeCat || c.tags.some((t) =>
            activeCat.toLowerCase().includes(t.toLowerCase()) ||
            t.toLowerCase().includes(activeCat.split(' ')[0].toLowerCase()));
        return ms && mc;
    });

    return (
        <Box>
            {/* ── HERO (charcoal banner) ────────────────────────────────────────── */}
            <Box sx={{
                pt: { xs: 7, md: 11 }, pb: { xs: 8, md: 12 }, px: 2,
                position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, ${BANNER_D} 0%, ${BANNER} 60%, #344055 100%)`,
            }}>
                {/* Moonstone glow */}
                <Box sx={{
                    position: 'absolute', top: '-10%', right: '-5%',
                    width: 380, height: 380, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(126,172,181,0.20) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <Box sx={{
                    position: 'absolute', bottom: '-18%', left: '-8%',
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(245,228,200,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container alignItems="center" spacing={5}>
                        <Grid item xs={12} md={7}>
                            <Chip
                                label="✦ Понад 620 курсів онлайн"
                                sx={{ mb: 3, bgcolor: MOON_P, color: MOON, border: '1px solid rgba(126,172,181,0.3)', fontWeight: 600 }}
                            />
                            <Typography variant="h2" sx={{
                                color: CHAMP, fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.2, mb: 2,
                            }}>
                                Навчайся у найкращих<br />
                                <Box component="span" sx={{ color: MOON }}>університетів світу</Box>
                            </Typography>
                            <Typography sx={{ color: CHAMP_A, fontSize: '1.05rem', mb: 4, lineHeight: 1.75 }}>
                                Понад 7 000 курсів від провідних університетів та компаній. Отримуй сертифікати, розвивай навички, будуй кар'єру.
                            </Typography>

                            {/* Search */}
                            <Box sx={{
                                display: 'flex', alignItems: 'center',
                                bgcolor: BG, border: `1px solid ${BORDER}`,
                                borderRadius: 2, overflow: 'hidden', maxWidth: 560,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                                '&:focus-within': { borderColor: MOON },
                            }}>
                                <SearchIcon sx={{ color: MOON, ml: 2, mr: 1, fontSize: 22 }} />
                                <InputBase
                                    fullWidth placeholder="Чого хочете навчитись?"
                                    value={search} onChange={(e) => setSearch(e.target.value)}
                                    sx={{ fontSize: '0.95rem', color: GUN, py: 1.5 }}
                                />
                                <Button variant="contained" color="primary"
                                    sx={{ m: 0.75, px: 3, borderRadius: 1.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    Знайти
                                </Button>
                            </Box>

                            {/* Trending */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                                <Typography variant="caption" sx={{ color: CHAMP_A }}>Популярне:</Typography>
                                {['Python', 'Data Science', 'React', 'Machine Learning'].map((tag) => (
                                    <Chip key={tag} label={tag} size="small" onClick={() => setSearch(tag)}
                                        sx={{
                                            bgcolor: MOON_P, color: MOON, border: '1px solid rgba(126,172,181,0.3)',
                                            cursor: 'pointer', fontSize: '0.75rem',
                                            '&:hover': { bgcolor: 'rgba(126,172,181,0.22)' },
                                        }} />
                                ))}
                            </Box>
                        </Grid>

                        {/* Progress card */}
                        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box sx={{
                                bgcolor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(126,172,181,0.25)',
                                borderRadius: 3, p: 3.5, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                            }}>
                                {[
                                    { label: 'Python для всіх', progress: 72, color: MOON },
                                    { label: 'Machine Learning', progress: 45, color: '#C4A886' },
                                    { label: 'Веб-розробка React', progress: 88, color: MOON_L },
                                ].map((item) => (
                                    <Box key={item.label} sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" sx={{ color: CHAMP, fontWeight: 600 }}>{item.label}</Typography>
                                            <Typography variant="body2" sx={{ color: CHAMP_A }}>{item.progress}%</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={item.progress}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: item.color } }} />
                                    </Box>
                                ))}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <VerifiedIcon sx={{ color: MOON, fontSize: 17 }} />
                                    <Typography variant="caption" sx={{ color: CHAMP_A }}>Сертифікат після завершення</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ── STATS (white) ─────────────────────────────────────────────────── */}
            <Box sx={{ bgcolor: BG, borderBottom: `1px solid ${BORDER}`, py: 3.5 }}>
                <Container maxWidth="lg">
                    <Grid container>
                        {STATS.map((s, i) => (
                            <Grid item xs={6} md={3} key={i}>
                                <Box sx={{ textAlign: 'center', py: 1.5, borderRight: i < 3 ? `1px solid ${BORDER}` : 'none' }}>
                                    <Typography variant="h5" fontWeight={800} sx={{ color: MOON_D }}>{s.value}</Typography>
                                    <Typography variant="caption" sx={{ color: TEXT_SEC }}>{s.label}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ── PARTNERS (light grey) ─────────────────────────────────────────── */}
            <Box sx={{ bgcolor: BG_LIGHT, borderBottom: `1px solid ${BORDER}`, py: 3 }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 3, md: 6 }, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{ color: TEXT_MUT, fontWeight: 700, letterSpacing: '0.12em' }}>ПАРТНЕРИ</Typography>
                        {PARTNERS.map((p) => (
                            <Typography key={p} sx={{ color: TEXT_SEC, fontWeight: 700, fontSize: '0.95rem' }}>{p}</Typography>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ── CATEGORIES (white) ────────────────────────────────────────────── */}
            <Box sx={{ bgcolor: BG, py: 7 }}>
                <Container maxWidth="lg">
                    <Typography variant="h5" fontWeight={700} sx={{ color: GUN, mb: 3 }}>
                        Ознайомтесь з нашими програмами
                    </Typography>
                    <Grid container spacing={1.5}>
                        {CATEGORIES.map((cat) => {
                            const isActive = activeCat === cat.label;
                            return (
                                <Grid item xs={6} sm={4} md={3} key={cat.label}>
                                    <Box
                                        onClick={() => setActiveCat(isActive ? '' : cat.label)}
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.25, p: 1.75,
                                            bgcolor: isActive ? `${cat.accent}14` : BG_LIGHT,
                                            border: `1px solid ${isActive ? cat.accent : BORDER}`,
                                            borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
                                            '&:hover': { borderColor: cat.accent, bgcolor: `${cat.accent}0e` },
                                        }}
                                    >
                                        <Box sx={{ color: cat.accent, display: 'flex', '& svg': { fontSize: '1.15rem' } }}>
                                            {cat.icon}
                                        </Box>
                                        <Typography variant="body2" fontWeight={600} fontSize="0.82rem"
                                            sx={{ color: isActive ? cat.accent : TEXT_SEC }}>
                                            {cat.label}
                                        </Typography>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            </Box>

            {/* ── COURSES (light grey) ──────────────────────────────────────────── */}
            <Box sx={{ bgcolor: BG_LIGHT, py: 7 }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 4 }}>
                        <Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: GUN }}>
                                {search ? `Результати: "${search}"` : activeCat || 'Популярні курси'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: TEXT_SEC, mt: 0.5 }}>
                                {filtered.length} {filtered.length === 1 ? 'результат' : 'результатів'}
                            </Typography>
                        </Box>
                        {(search || activeCat) && (
                            <Button size="small" color="primary" onClick={() => { setSearch(''); setActiveCat(''); }}>
                                Скинути
                            </Button>
                        )}
                    </Box>

                    {filtered.length === 0 ? (
                        <Box textAlign="center" py={10}>
                            <Typography fontSize="2.5rem" mb={1}>🔍</Typography>
                            <Typography sx={{ color: TEXT_SEC }}>Нічого не знайдено</Typography>
                            <Button sx={{ mt: 2 }} color="primary" onClick={() => { setSearch(''); setActiveCat(''); }}>
                                Показати всі курси
                            </Button>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {filtered.map((c) => (
                                <Grid item xs={12} sm={6} md={4} key={c.id}>
                                    <CourseCard course={c} />
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {!search && !activeCat && (
                        <Box textAlign="center" mt={5}>
                            <Button variant="outlined" color="primary" size="large" endIcon={<ArrowForwardIcon />} sx={{ px: 4 }}>
                                Переглянути всі курси
                            </Button>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* ── WHY US (white) ────────────────────────────────────────────────── */}
            <Box sx={{ bgcolor: BG, py: 8, borderTop: `1px solid ${BORDER}` }}>
                <Container maxWidth="lg">
                    <Typography variant="h5" fontWeight={700} sx={{ color: GUN, textAlign: 'center', mb: 5 }}>
                        Чому обирають EduHub?
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            { emoji: '🎓', title: '12 000+ студентів', desc: 'Вже проходять курси на платформі' },
                            { emoji: '🏛️', title: '50+ партнерів', desc: 'Провідні університети та tech-компанії' },
                            { emoji: '📜', title: 'Офіційні сертифікати', desc: 'Визнані роботодавцями по всьому світу' },
                            { emoji: '⏰', title: 'Гнучкий графік', desc: 'Навчайтесь у зручний час і темп' },
                        ].map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={item.title}>
                                <Box sx={{
                                    bgcolor: BG_LIGHT, border: `1px solid ${BORDER}`,
                                    borderRadius: 2, p: 3, textAlign: 'center', height: '100%',
                                }}>
                                    <Typography fontSize="2.2rem" mb={1.5}>{item.emoji}</Typography>
                                    <Typography fontWeight={700} sx={{ color: GUN, mb: 0.75 }}>{item.title}</Typography>
                                    <Typography variant="body2" sx={{ color: TEXT_SEC, lineHeight: 1.6 }}>{item.desc}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ── CTA (charcoal banner) ─────────────────────────────────────────── */}
            <Box sx={{
                py: { xs: 7, md: 10 }, textAlign: 'center', px: 2,
                background: `linear-gradient(135deg, ${BANNER_D} 0%, ${BANNER} 100%)`,
                borderTop: `1px solid rgba(126,172,181,0.15)`,
            }}>
                <Container maxWidth="sm">
                    <Box sx={{
                        display: 'inline-block', bgcolor: MOON_P, color: MOON,
                        px: 2, py: 0.5, borderRadius: 50, fontSize: '0.8rem', fontWeight: 600, mb: 3,
                        border: '1px solid rgba(126,172,181,0.25)',
                    }}>
                        🚀 Безкоштовна реєстрація
                    </Box>
                    <Typography variant="h4" fontWeight={800}
                        sx={{ color: CHAMP, mb: 1.5, letterSpacing: '-0.02em' }}>
                        Починайте навчатися сьогодні
                    </Typography>
                    <Typography sx={{ color: CHAMP_A, mb: 4, fontSize: '1rem' }}>
                        Приєднуйтесь до тисяч студентів і зробіть перший крок до нової кар'єри.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button variant="contained" color="primary" size="large"
                            onClick={() => navigate('/login')} sx={{ px: 5, py: 1.5, fontSize: '1rem' }}>
                            Приєднатись безкоштовно
                        </Button>
                        <Button variant="outlined" size="large"
                            onClick={() => navigate('/login')}
                            sx={{
                                px: 4, py: 1.5, fontSize: '1rem',
                                borderColor: 'rgba(245,228,200,0.35)', color: CHAMP,
                                '&:hover': { borderColor: CHAMP, bgcolor: 'rgba(245,228,200,0.07)' },
                            }}>
                            Для викладачів
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* ── FOOTER (deep charcoal) ────────────────────────────────────────── */}
            <Box sx={{ bgcolor: BANNER_D, borderTop: '1px solid rgba(126,172,181,0.12)', py: 5, px: 4 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <SchoolIcon sx={{ color: MOON, fontSize: 22 }} />
                                <Typography fontWeight={800} sx={{ color: CHAMP, fontSize: '1.05rem' }}>EduHub</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(245,228,200,0.4)', lineHeight: 1.7 }}>
                                Онлайн-платформа для навчання з курсами від провідних університетів та компаній.
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography fontWeight={700} sx={{ color: CHAMP_A, mb: 1.5 }} variant="body2">Навчання</Typography>
                            {['Курси', 'Спеціалізації', 'Сертифікати'].map((l) => (
                                <Typography key={l} variant="body2"
                                    sx={{ color: 'rgba(245,228,200,0.35)', mb: 0.75, cursor: 'pointer', '&:hover': { color: MOON } }}>
                                    {l}
                                </Typography>
                            ))}
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography fontWeight={700} sx={{ color: CHAMP_A, mb: 1.5 }} variant="body2">Компанія</Typography>
                            {['Про нас', 'Партнери', 'Контакти'].map((l) => (
                                <Typography key={l} variant="body2"
                                    sx={{ color: 'rgba(245,228,200,0.35)', mb: 0.75, cursor: 'pointer', '&:hover': { color: MOON } }}>
                                    {l}
                                </Typography>
                            ))}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography fontWeight={700} sx={{ color: CHAMP_A, mb: 1.5 }} variant="body2">Для викладачів</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(245,228,200,0.4)', lineHeight: 1.7, mb: 2 }}>
                                Створюй та публікуй курси. Монетизуй свої знання.
                            </Typography>
                            <Button variant="outlined" size="small" color="primary"
                                onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>
                                Стати викладачем
                            </Button>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 4, borderColor: 'rgba(126,172,181,0.12)' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(245,228,200,0.2)' }}>
                        © 2026 EduHub, Inc. Всі права захищені.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}
