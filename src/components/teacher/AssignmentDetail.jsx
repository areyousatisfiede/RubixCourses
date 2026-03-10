// src/components/teacher/AssignmentDetail.jsx
// Деталі завдання для викладача: список submissions + оцінювання

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Divider, Link, Stack, TextField, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradeIcon from '@mui/icons-material/Grade';
import {
    getAssignments,
    getSubmissionsForAssignment,
    gradeSubmission,
} from '../../firebase/firestoreHelpers';
import Navbar from '../shared/Navbar';

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
            await gradeSubmission(submissionId, gradeNum, comment || '');
            setSuccess('Оцінку збережено ✓');
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            setError('Помилка збереження оцінки');
        } finally {
            setSaving((p) => ({ ...p, [submissionId]: false }));
        }
    }

    if (loading) return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
            <Box textAlign="center" pt={8}><CircularProgress /></Box>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
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

                <Typography variant="h6" mb={2}>
                    Надіслані роботи ({submissions.length})
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {submissions.length === 0 ? (
                    <Card sx={{ textAlign: 'center', py: 6 }}>
                        <GradeIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Студенти ще не подали роботи</Typography>
                    </Card>
                ) : (
                    <Stack spacing={2}>
                        {submissions.map((sub) => (
                            <Card key={sub.id}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            Студент ID: {sub.studentId}
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
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}
