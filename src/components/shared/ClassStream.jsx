// src/components/shared/ClassStream.jsx
// Стрім класу — оголошення вчителя + коментарі студентів

import React, { useEffect, useState } from 'react';
import {
    Alert, Avatar, Box, Button, Card, CardContent, CardActions,
    Chip, CircularProgress, Collapse, Container, Divider,
    IconButton, InputBase, Paper, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SendIcon from '@mui/icons-material/Send';
import PushPinIcon from '@mui/icons-material/PushPin';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';
import {
    createAnnouncement,
    deleteAnnouncement,
    subscribeAnnouncements,
    addAnnouncementComment,
    subscribeAnnouncementComments,
    createNotification,
    getAllStudents,
} from '../../firebase/firestoreHelpers';

const MOON = '#7EACB5';
const MOON_P = 'rgba(126,172,181,0.12)';
const GUN = '#1B242A';
const BANNER = '#2D3748';
const BANNER_D = '#1e2a38';
const CHAMP = '#F5E4C8';

function timeAgo(ts) {
    if (!ts) return '';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    const mins = Math.round((Date.now() - d) / 60000);
    if (mins < 1) return 'щойно';
    if (mins < 60) return `${mins} хв тому`;
    if (mins < 1440) return `${Math.round(mins / 60)} год тому`;
    return d.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long' });
}

// ─── Блок коментарів для одного оголошення ──────────────────────────────────
function AnnouncementComments({ announcementId }) {
    const { user, role } = useAuth();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const unsub = subscribeAnnouncementComments(announcementId, setComments);
        return unsub;
    }, [announcementId]);

    async function handleSend(e) {
        e.preventDefault();
        if (!text.trim() || sending) return;
        setSending(true);
        try {
            await addAnnouncementComment(announcementId, {
                authorId: user.uid,
                authorName: user.displayName || user.email?.split('@')[0] || '?',
                text: text.trim(),
            });
            setText('');
        } finally {
            setSending(false);
        }
    }

    return (
        <Box sx={{ px: 2, pb: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            {comments.map((c) => (
                <Box key={c.id} sx={{ display: 'flex', gap: 1.2, mb: 1.2 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: MOON, fontSize: 11, fontWeight: 700 }}>
                        {(c.authorName || '?')[0].toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="caption" fontWeight={700} sx={{ color: GUN }}>{c.authorName}</Typography>
                        <Typography variant="body2" sx={{ color: GUN, lineHeight: 1.45 }}>{c.text}</Typography>
                        <Typography variant="caption" color="text.disabled">{timeAgo(c.createdAt)}</Typography>
                    </Box>
                </Box>
            ))}
            <Paper
                component="form" onSubmit={handleSend} elevation={0}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 1, mt: 1,
                    px: 1.5, py: 0.5,
                    border: `1px solid ${MOON}50`, borderRadius: 3,
                    '&:focus-within': { borderColor: MOON, boxShadow: `0 0 0 2px ${MOON}22` },
                }}
            >
                <Avatar sx={{ width: 24, height: 24, bgcolor: role === 'teacher' ? BANNER : MOON, fontSize: 10 }}>
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                </Avatar>
                <InputBase
                    fullWidth placeholder="Додати коментар…"
                    value={text} onChange={(e) => setText(e.target.value)}
                    sx={{ fontSize: '0.85rem' }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                />
                <Tooltip title="Надіслати">
                    <span>
                        <IconButton type="submit" size="small" disabled={!text.trim() || sending} sx={{ color: MOON }}>
                            {sending ? <CircularProgress size={14} /> : <SendIcon fontSize="small" />}
                        </IconButton>
                    </span>
                </Tooltip>
            </Paper>
        </Box>
    );
}

// ─── Одна картка оголошення ──────────────────────────────────────────────────
function AnnouncementCard({ ann, isTeacher }) {
    const [expanded, setExpanded] = useState(false);

    async function handleDelete() {
        if (!window.confirm('Видалити це оголошення?')) return;
        await deleteAnnouncement(ann.id);
    }

    return (
        <Card
            sx={{
                mb: 2,
                border: ann.pinned ? `1.5px solid ${MOON}` : '1px solid rgba(0,0,0,0.08)',
                boxShadow: ann.pinned ? `0 2px 16px ${MOON}28` : 'none',
            }}
        >
            <CardContent sx={{ pb: 1 }}>
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    <Avatar sx={{ bgcolor: BANNER, width: 38, height: 38, fontSize: 14, fontWeight: 700 }}>
                        {(ann.authorName || '?')[0].toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                            <Typography fontWeight={700} fontSize="0.9rem" sx={{ color: GUN }}>
                                {ann.authorName}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">·</Typography>
                            <Typography variant="caption" color="text.disabled">{timeAgo(ann.createdAt)}</Typography>
                            {ann.pinned && (
                                <Chip icon={<PushPinIcon sx={{ fontSize: '0.85rem !important' }} />}
                                    label="Закріплено" size="small"
                                    sx={{ bgcolor: MOON_P, color: MOON, fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                            )}
                        </Stack>
                        {ann.title && (
                            <Typography fontWeight={700} sx={{ color: GUN, mt: 0.5 }}>{ann.title}</Typography>
                        )}
                        <Typography variant="body2" sx={{ color: '#4A5568', mt: 0.25, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                            {ann.body}
                        </Typography>
                    </Box>
                    {isTeacher && (
                        <Tooltip title="Видалити">
                            <IconButton size="small" onClick={handleDelete} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </CardContent>

            <CardActions sx={{ px: 2, pt: 0, pb: expanded ? 0 : 1 }}>
                <Button
                    size="small" onClick={() => setExpanded(!expanded)}
                    endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ color: MOON, fontWeight: 600, textTransform: 'none', fontSize: '0.8rem' }}
                >
                    Коментарі
                </Button>
            </CardActions>

            <Collapse in={expanded}>
                <AnnouncementComments announcementId={ann.id} />
            </Collapse>
        </Card>
    );
}

// ─── Головний компонент ──────────────────────────────────────────────────────
export default function ClassStream() {
    const { user, role } = useAuth();
    const isTeacher = role === 'teacher';

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [pinned, setPinned] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsub = subscribeAnnouncements((list) => {
            setAnnouncements(list);
            setLoading(false);
        });
        return unsub;
    }, []);

    async function handlePost(e) {
        e.preventDefault();
        if (!body.trim()) return;
        setPosting(true);
        setError('');
        try {
            await createAnnouncement({
                title: title.trim(),
                body: body.trim(),
                pinned,
                authorId: user.uid,
                authorName: user.displayName || user.email?.split('@')[0] || 'Викладач',
            });

            // Сповіщаємо всіх студентів
            const students = await getAllStudents();
            await Promise.all(
                students.map((s) =>
                    createNotification(s.uid, 'announcement', '', `Нове оголошення: «${title || body.slice(0, 40)}»`)
                )
            );

            setTitle(''); setBody(''); setPinned(false); setShowForm(false);
        } catch {
            setError('Помилка публікації');
        } finally {
            setPosting(false);
        }
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb' }}>
            <Container maxWidth="md" sx={{ py: 4 }}>

                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <CampaignIcon sx={{ fontSize: 28, color: MOON }} />
                        <Box>
                            <Typography variant="h5" fontWeight={800} sx={{ color: GUN }}>Стрім класу</Typography>
                            <Typography variant="caption" color="text.secondary">Оголошення та обговорення</Typography>
                        </Box>
                    </Stack>
                    {isTeacher && (
                        <Button
                            variant="contained" startIcon={<AddIcon />}
                            onClick={() => setShowForm(!showForm)}
                            sx={{ bgcolor: MOON, '&:hover': { bgcolor: '#5F8F99' }, fontWeight: 700 }}
                        >
                            Оголошення
                        </Button>
                    )}
                </Stack>

                {/* Форма нового оголошення (лише вчитель) */}
                {isTeacher && showForm && (
                    <Card sx={{ mb: 3, border: `1.5px solid ${MOON}40` }}>
                        <CardContent>
                            <Typography fontWeight={700} mb={1.5} sx={{ color: GUN }}>Нове оголошення</Typography>
                            {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
                            <Stack spacing={1.5} component="form" onSubmit={handlePost}>
                                <TextField
                                    label="Заголовок (необов'язково)" size="small" fullWidth
                                    value={title} onChange={(e) => setTitle(e.target.value)}
                                />
                                <TextField
                                    label="Текст оголошення *" multiline rows={4} fullWidth required
                                    value={body} onChange={(e) => setBody(e.target.value)}
                                />
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Button
                                        variant="contained" type="submit" disabled={!body.trim() || posting}
                                        sx={{ bgcolor: MOON, '&:hover': { bgcolor: '#5F8F99' }, fontWeight: 700 }}
                                    >
                                        {posting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Опублікувати'}
                                    </Button>
                                    <Button onClick={() => setShowForm(false)} sx={{ color: 'text.secondary' }}>
                                        Скасувати
                                    </Button>
                                    <Chip
                                        icon={<PushPinIcon sx={{ fontSize: '0.9rem !important' }} />}
                                        label="Закріпити"
                                        clickable onClick={() => setPinned(!pinned)}
                                        sx={{
                                            bgcolor: pinned ? MOON_P : 'transparent',
                                            borderColor: pinned ? MOON : 'rgba(0,0,0,0.15)',
                                            color: pinned ? MOON : 'text.secondary',
                                            border: '1px solid',
                                            fontWeight: 600,
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Список оголошень */}
                {loading ? (
                    <Box textAlign="center" py={8}><CircularProgress sx={{ color: MOON }} /></Box>
                ) : announcements.length === 0 ? (
                    <Card sx={{ textAlign: 'center', py: 8 }}>
                        <CampaignIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Оголошень ще немає</Typography>
                        {isTeacher && (
                            <Button sx={{ mt: 2, color: MOON }} onClick={() => setShowForm(true)}>
                                Опублікувати перше оголошення
                            </Button>
                        )}
                    </Card>
                ) : (
                    <>
                        {/* Закріплені вгорі */}
                        {announcements.filter((a) => a.pinned).map((a) => (
                            <AnnouncementCard key={a.id} ann={a} isTeacher={isTeacher} />
                        ))}
                        {/* Решта */}
                        {announcements.filter((a) => !a.pinned).map((a) => (
                            <AnnouncementCard key={a.id} ann={a} isTeacher={isTeacher} />
                        ))}
                    </>
                )}
            </Container>
        </Box>
    );
}
