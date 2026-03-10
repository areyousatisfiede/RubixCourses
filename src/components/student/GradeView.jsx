// src/components/student/GradeView.jsx
// Перегляд усіх оцінок та коментарів студента

import React, { useEffect, useState } from 'react';
import {
    Alert, Box, Card, CardContent, Chip, CircularProgress,
    Container, Divider, Stack, Typography,
} from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../../context/AuthContext';
import { getAssignments, getSubmissionsForStudent } from '../../firebase/firestoreHelpers';
import Navbar from '../shared/Navbar';

function gradeColor(grade) {
    if (grade >= 90) return 'success';
    if (grade >= 70) return 'info';
    if (grade >= 50) return 'warning';
    return 'error';
}

export default function GradeView() {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);       // { assignmentTitle, grade, comment, gradedAt }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const [assignments, submissions] = await Promise.all([
                    getAssignments(),
                    getSubmissionsForStudent(user.uid),
                ]);
                // Зʼєднуємо submissions з назвами завдань
                const combined = submissions.map((sub) => {
                    const assignment = assignments.find((a) => a.id === sub.assignmentId);
                    return {
                        id: sub.id,
                        assignmentTitle: assignment?.title || 'Невідоме завдання',
                        grade: sub.grade,
                        comment: sub.comment,
                        gradedAt: sub.gradedAt,
                        submittedAt: sub.submittedAt,
                    };
                });
                setRows(combined);
            } catch (e) {
                setError('Помилка завантаження оцінок');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user.uid]);

    // Підраховуємо середню оцінку
    const graded = rows.filter((r) => r.grade != null);
    const average = graded.length
        ? Math.round(graded.reduce((s, r) => s + r.grade, 0) / graded.length)
        : null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <GradeIcon sx={{ fontSize: 34, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h4">Мої оцінки</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Здано: {rows.length} | Оцінено: {graded.length}
                        </Typography>
                    </Box>
                </Stack>

                {/* Середня оцінка */}
                {average != null && (
                    <Card
                        sx={{
                            mb: 3,
                            background: 'linear-gradient(135deg, #5c6bc0 0%, #26a69a 100%)',
                            color: 'white',
                        }}
                    >
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <EmojiEventsIcon sx={{ fontSize: 48 }} />
                                <Box>
                                    <Typography variant="h3" fontWeight={700}>{average}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                        Середня оцінка зі 100
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                    <Box textAlign="center" py={6}><CircularProgress /></Box>
                ) : rows.length === 0 ? (
                    <Card sx={{ textAlign: 'center', py: 6 }}>
                        <GradeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Ви ще не здали жодного завдання</Typography>
                    </Card>
                ) : (
                    <Stack spacing={2}>
                        {rows.map((row) => (
                            <Card
                                key={row.id}
                                sx={{
                                    borderLeft: row.grade != null
                                        ? `4px solid ${row.grade >= 70 ? '#43a047' : '#ef5350'}`
                                        : '4px solid #bdbdbd',
                                }}
                            >
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Typography variant="h6" flex={1}>{row.assignmentTitle}</Typography>
                                        {row.grade != null ? (
                                            <Chip
                                                label={`${row.grade} / 100`}
                                                color={gradeColor(row.grade)}
                                                sx={{ fontWeight: 700, fontSize: '1rem', px: 1 }}
                                            />
                                        ) : (
                                            <Chip label="Очікує оцінки" size="small" />
                                        )}
                                    </Stack>

                                    {row.comment && (
                                        <>
                                            <Divider sx={{ my: 1.5 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                💬 <strong>Коментар викладача:</strong> {row.comment}
                                            </Typography>
                                        </>
                                    )}

                                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                        {row.gradedAt
                                            ? `Оцінено: ${new Date(row.gradedAt.seconds * 1000).toLocaleString('uk-UA')}`
                                            : row.submittedAt
                                                ? `Здано: ${new Date(row.submittedAt.seconds * 1000).toLocaleString('uk-UA')}`
                                                : ''}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}
