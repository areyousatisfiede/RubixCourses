// src/components/teacher/AssignmentDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Divider, Grid, Slider, Snackbar, Stack, TextField,
    Typography, IconButton, Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplyIcon from '@mui/icons-material/Reply';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useAuth } from '../../context/AuthContext';
import {
    getAssignmentById,
    getSubmissionsForAssignment,
    gradeSubmission,
    returnSubmission,
    createNotification,
    getUsersByIds,
    fileUrl,
} from '../../api/endpoints';
import SubmissionComments from '../shared/SubmissionComments';

const MOON = '#7EACB5';
const GUN = '#1B242A';

export default function AssignmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [students, setStudents] = useState({});
    const [loading, setLoading] = useState(true);
    const [grades, setGrades] = useState({});
    const [comments, setComments] = useState({});
    const [saving, setSaving] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    useEffect(() => {
        async function load() {
            try {
                const [a, subs] = await Promise.all([
                    getAssignmentById(id),
                    getSubmissionsForAssignment(id),
                ]);
                setAssignment(a);
                setSubmissions(subs);

                // Ініціалізувати оцінки та коментарі
                const g = {}, c = {};
                subs.forEach(s => {
                    g[s._id] = s.grade ?? '';
                    c[s._id] = s.comment ?? '';
                });
                setGrades(g);
                setComments(c);

                // Завантажити імена студентів
                const uids = [...new Set(subs.map(s => s.studentId))];
                if (uids.length) {
                    const users = await getUsersByIds(uids);
                    const map = {};
                    users.forEach(u => { map[u._id] = u; });
                    setStudents(map);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleGrade = async (sub) => {
        setSaving(sub._id);
        try {
            await gradeSubmission(sub._id, grades[sub._id], comments[sub._id]);
            await createNotification(sub.studentId, 'grade', id,
                `Ваша робота «${assignment.title}» оцінена: ${grades[sub._id]}`);
            setSnack({ open: true, msg: '✓ Оцінку збережено', severity: 'success' });
            // Оновити статус
            setSubmissions(prev => prev.map(s =>
                s._id === sub._id ? { ...s, grade: Number(grades[sub._id]), comment: comments[sub._id], status: 'graded' } : s
            ));
        } catch (e) {
            setSnack({ open: true, msg: e.message, severity: 'error' });
        } finally {
            setSaving(null);
        }
    };

    const handleReturn = async (sub) => {
        setSaving(sub._id);
        try {
            await returnSubmission(sub._id, grades[sub._id], comments[sub._id]);
            await createNotification(sub.studentId, 'grade', id,
                `Вашу роботу «${assignment.title}» повернуто з оцінкою: ${grades[sub._id]}`);
            setSnack({ open: true, msg: '✓ Роботу повернуто студенту', severity: 'success' });
            setSubmissions(prev => prev.map(s =>
                s._id === sub._id ? { ...s, grade: Number(grades[sub._id]), comment: comments[sub._id], status: 'returned' } : s
            ));
        } catch (e) {
            setSnack({ open: true, msg: e.message, severity: 'error' });
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
                <CircularProgress sx={{ color: MOON }} />
            </Box>
        );
    }

    if (!assignment) {
        return (
            <Container maxWidth="md" sx={{ pt: 6 }}>
                <Typography>Завдання не знайдено</Typography>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/teacher')}
                    sx={{ mb: 2, color: GUN, fontWeight: 600 }}
                >
                    Назад
                </Button>

                {/* Інформація про завдання */}
                <Card sx={{ borderRadius: 3, mb: 3 }}>
                    <CardContent>
                        <Typography variant="h5" fontWeight={800} color={GUN} gutterBottom>
                            {assignment.title}
                        </Typography>
                        {assignment.description && (
                            <Typography variant="body1" color="text.secondary" mb={2}>
                                {assignment.description}
                            </Typography>
                        )}
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {assignment.dueDate && (
                                <Chip
                                    label={`Дедлайн: ${new Date(assignment.dueDate).toLocaleDateString('uk-UA')}`}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                            <Chip
                                label={`${submissions.length} здач`}
                                size="small"
                                sx={{ bgcolor: `${MOON}15`, color: MOON, fontWeight: 600 }}
                            />
                        </Stack>

                        {/* Прикріплення завдання */}
                        {assignment.attachments?.length > 0 && (
                            <Box mt={2}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    📎 Прикріплені файли:
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {assignment.attachments.map((att, i) => (
                                        <Chip
                                            key={i}
                                            icon={<AttachFileIcon />}
                                            label={att.filename}
                                            component="a"
                                            href={fileUrl(att.url)}
                                            target="_blank"
                                            clickable
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Здачі студентів */}
                <Typography variant="h6" fontWeight={700} color={GUN} mb={2}>
                    Здачі студентів ({submissions.length})
                </Typography>

                {submissions.length === 0 ? (
                    <Card sx={{ textAlign: 'center', py: 6, borderRadius: 3 }}>
                        <Typography color="text.secondary">Поки ніхто не здав роботу</Typography>
                    </Card>
                ) : (
                    <Stack spacing={2}>
                        {submissions.map((sub) => {
                            const studentName = students[sub.studentId]?.displayName || students[sub.studentId]?.email || sub.studentId;
                            return (
                                <Card key={sub._id} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                    <CardContent>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} color={GUN}>
                                                    {studentName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Здано: {new Date(sub.createdAt).toLocaleString('uk-UA')}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={
                                                    sub.status === 'returned' ? 'Повернуто' :
                                                        sub.status === 'graded' ? 'Оцінено' : 'Очікує'
                                                }
                                                size="small"
                                                color={
                                                    sub.status === 'returned' ? 'success' :
                                                        sub.status === 'graded' ? 'primary' : 'default'
                                                }
                                            />
                                        </Stack>

                                        {/* Файл здачі */}
                                        {sub.fileURL && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<DownloadIcon />}
                                                href={fileUrl(sub.fileURL)}
                                                target="_blank"
                                                sx={{ mb: 2 }}
                                            >
                                                Завантажити файл
                                            </Button>
                                        )}

                                        {sub.attachments?.length > 0 && (
                                            <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                                                {sub.attachments.map((att, i) => (
                                                    <Chip
                                                        key={i}
                                                        icon={<AttachFileIcon />}
                                                        label={att.filename}
                                                        component="a"
                                                        href={fileUrl(att.url)}
                                                        target="_blank"
                                                        clickable
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Stack>
                                        )}

                                        <Divider sx={{ my: 2 }} />

                                        {/* Оцінювання */}
                                        <Grid container spacing={2} alignItems="flex-start">
                                            <Grid item xs={12} sm={3}>
                                                <TextField
                                                    label="Оцінка (0-100)"
                                                    type="number"
                                                    size="small"
                                                    fullWidth
                                                    value={grades[sub._id] ?? ''}
                                                    onChange={(e) => setGrades(p => ({ ...p, [sub._id]: e.target.value }))}
                                                    inputProps={{ min: 0, max: 100 }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={5}>
                                                <TextField
                                                    label="Коментар викладача"
                                                    size="small"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    value={comments[sub._id] ?? ''}
                                                    onChange={(e) => setComments(p => ({ ...p, [sub._id]: e.target.value }))}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={saving === sub._id ? <CircularProgress size={14} /> : <CheckCircleIcon />}
                                                        onClick={() => handleGrade(sub)}
                                                        disabled={saving === sub._id || !grades[sub._id]}
                                                        sx={{ bgcolor: MOON, '&:hover': { bgcolor: '#5F8F99' } }}
                                                    >
                                                        Оцінити
                                                    </Button>
                                                    <Tooltip title="Повернути роботу студенту з оцінкою та коментарем">
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<ReplyIcon />}
                                                            onClick={() => handleReturn(sub)}
                                                            disabled={saving === sub._id || !grades[sub._id]}
                                                            sx={{ borderColor: MOON, color: MOON }}
                                                        >
                                                            Повернути
                                                        </Button>
                                                    </Tooltip>
                                                </Stack>
                                            </Grid>
                                        </Grid>

                                        {/* Приватні коментарі */}
                                        <Box mt={2}>
                                            <SubmissionComments
                                                submissionId={sub._id}
                                                assignmentId={id}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                )}
            </Container>

            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
