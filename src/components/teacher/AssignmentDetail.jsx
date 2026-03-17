// src/components/teacher/AssignmentDetail.jsx
// Деталі завдання для викладача: список submissions + оцінювання

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Divider, Link, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradeIcon from '@mui/icons-material/Grade';
import {
    getAssignments,
    getSubmissionsForAssignment,
    gradeSubmission,
    createNotification,
} from '../../firebase/firestoreHelpers';
import SubmissionComments from '../shared/SubmissionComments';

const MOON = '#7EACB5';
const MOON_D = '#5F8F99';
const GUN = '#1B242A';

export default function TeacherAssignmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [grades, setGrades] = useState({});    // { submissionId: { grade, comment } }
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterTab, setFilterTab] = useState(0); // 0=all, 1=ungraded, 2=graded

    useEffect(() => {
        async function load() {
            try {
                const all = await getAssignments();
                const found = all.find((a) => a.id === id);
                setAssignment(found || null);
                const subs = await getSubmissionsForAssignment(id);
                setSubmissions(subs);
                // Ініціалізуємо локальний стан оцінок
                const init = {};
                subs.forEach((s) => {
                    init[s.id] = { grade: s.grade ?? '', comment: s.comment ?? '' };
                });
                setGrades(init);
            } catch (e) {
                setError('Помилка завантаження');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    async function handleGrade(submissionId) {
        const { grade, comment } = grades[submissionId] || {};
        const gradeNum = Number(grade);
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
            setError('Оцінка має бути числом від 0 до 100');
            return;
        }
        setSaving((p) => ({ ...p, [submissionId]: true }));
        setError('');
        try {
            const sub = submissions.find((s) => s.id === submissionId);
            await gradeSubmission(submissionId, gradeNum, comment || '');
            // Сповіщуємо студента про нову оцінку
            if (sub?.studentId) {
                await createNotification(
                    sub.studentId,
                    'grade',
                    submissionId,
                    `Вашу роботу оцінено: ${gradeNum} / 100`
                );
            }
            setSuccess('Оцінку збережено ✓');
            setTimeout(() => setSuccess(''), 3000);
            // Оновлюємо локальний стан
            setSubmissions((prev) =>
                prev.map((s) => s.id === submissionId ? { ...s, grade: gradeNum, comment: comment || '' } : s)
            );
        } catch (e) {
            setError('Помилка збереження оцінки');
        } finally {
            setSaving((p) => ({ ...p, [submissionId]: false }));
        }
    }

    if (loading) return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Box textAlign="center" pt={8}><CircularProgress sx={{ color: MOON }} /></Box>
        </Box>
    );

    const filtered = submissions.filter((s) => {
        if (filterTab === 1) return s.grade == null;
        if (filterTab === 2) return s.grade != null;
        return true;
    });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teacher')} sx={{ mb: 2 }}>
                    До списку завдань
                </Button>

                {/* Заголовок завдання */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h5">{assignment?.title}</Typography>
                        <Typography variant="body1" color="text.secondary" mt={1}>
                            {assignment?.description}
                        </Typography>
                    </CardContent>
                </Card>

                <Typography variant="h6" mb={1}>
                    Надіслані роботи ({submissions.length})
                </Typography>

                {/* Таби фільтрації */}
                <Tabs
                    value={filterTab}
                    onChange={(_, v) => setFilterTab(v)}
                    sx={{ mb: 2, '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' } }}
                >
                    <Tab label={`Всі (${submissions.length})`} />
                    <Tab label={`Не оцінені (${submissions.filter(s => s.grade == null).length})`} />
                    <Tab label={`Оцінені (${submissions.filter(s => s.grade != null).length})`} />
                </Tabs>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {filtered.length === 0 ? (
                    <Card sx={{ textAlign: 'center', py: 6 }}>
                        <GradeIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">
                            {filterTab === 1 ? 'Всі роботи оцінено!' : 'Студенти ще не подали роботи'}
                        </Typography>
                    </Card>
                ) : (
                    <Stack spacing={2}>
                        {filtered.map((sub) => (
                            <Card key={sub.id} sx={{ border: sub.grade != null ? `1px solid ${MOON}40` : undefined }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: GUN }}>
                                            Студент: {sub.studentName || sub.studentId?.slice(0, 12) + '...'}
                                        </Typography>
                                        <Chip
                                            label={sub.grade != null ? `Оцінка: ${sub.grade}` : 'Не оцінено'}
                                            color={sub.grade != null ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Stack>

                                    <Link href={sub.fileURL} target="_blank" rel="noopener" variant="body2">
                                        📎 Переглянути файл
                                    </Link>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                        Подано:{' '}
                                        {sub.submittedAt
                                            ? new Date(sub.submittedAt.seconds * 1000).toLocaleString('uk-UA')
                                            : '—'}
                                    </Typography>

                                    <Divider sx={{ mb: 2 }} />

                                    {/* Форма оцінювання */}
                                    <Stack spacing={1.5}>
                                        <TextField
                                            label="Оцінка (0–100)"
                                            type="number"
                                            size="small"
                                            inputProps={{ min: 0, max: 100 }}
                                            value={grades[sub.id]?.grade ?? ''}
                                            onChange={(e) =>
                                                setGrades((p) => ({ ...p, [sub.id]: { ...p[sub.id], grade: e.target.value } }))
                                            }
                                            sx={{ maxWidth: 160 }}
                                        />
                                        <TextField
                                            label="Коментар"
                                            multiline
                                            rows={2}
                                            size="small"
                                            value={grades[sub.id]?.comment ?? ''}
                                            onChange={(e) =>
                                                setGrades((p) => ({ ...p, [sub.id]: { ...p[sub.id], comment: e.target.value } }))
                                            }
                                        />
                                        <Button
                                            variant="contained"
                                            size="small"
                                            disabled={saving[sub.id]}
                                            onClick={() => handleGrade(sub.id)}
                                            sx={{ alignSelf: 'flex-start' }}
                                        >
                                            {saving[sub.id] ? <CircularProgress size={16} /> : 'Зберегти оцінку'}
                                        </Button>
                                    </Stack>

                                    <Divider sx={{ mt: 2, mb: 1 }} />
                                    <SubmissionComments
                                        submissionId={sub.id}
                                        assignmentId={id}
                                        otherUserId={sub.studentId}
                                        otherUserName={sub.studentName || sub.studentId?.slice(0, 8)}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}
