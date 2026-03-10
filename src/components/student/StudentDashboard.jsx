// src/components/student/StudentDashboard.jsx
// Головна панель студента: список завдань зі статусами

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert, Box, Button, Card, CardActionArea, CardContent,
    Chip, CircularProgress, Container, Stack, Typography,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import GradeIcon from '@mui/icons-material/Grade';
import { useAuth } from '../../context/AuthContext';
import { getAssignments, getSubmissionsForStudent } from '../../firebase/firestoreHelpers';
import Navbar from '../shared/Navbar';

export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);   // submissions поточного студента
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const [aList, sList] = await Promise.all([
                    getAssignments(),
                    getSubmissionsForStudent(user.uid),
                ]);
                setAssignments(aList);
                setSubmissions(sList);
            } catch (e) {
                setError('Помилка завантаження даних');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user.uid]);

    // Перевіряємо, чи студент здав роботу по завданню
    function getSubmission(assignmentId) {
        return submissions.find((s) => s.assignmentId === assignmentId) || null;
    }

    function formatDate(ts) {
        if (!ts) return '—';
        const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
        return d.toLocaleDateString('uk-UA');
    }

    function isOverdue(ts) {
        if (!ts) return false;
        const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
        return d < new Date();
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4">Мої завдання</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Всього: {assignments.length} | Здано: {submissions.length}
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<GradeIcon />}
                        onClick={() => navigate('/student/grades')}
                    >
                        Переглянути оцінки
                    </Button>
                </Stack>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                    <Box textAlign="center" py={6}><CircularProgress /></Box>
                ) : assignments.length === 0 ? (
                    <Card sx={{ textAlign: 'center', py: 6 }}>
                        <AssignmentTurnedInIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Завдань поки немає</Typography>
                    </Card>
                ) : (
                    <Stack spacing={2}>
                        {assignments.map((a) => {
                            const sub = getSubmission(a.id);
                            const submitted = !!sub;
                            const graded = sub?.grade != null;
                            const overdue = !submitted && isOverdue(a.dueDate);

                            return (
                                <Card
                                    key={a.id}
                                    sx={{
                                        borderLeft: `4px solid ${submitted ? '#43a047' : overdue ? '#ef5350' : '#5c6bc0'}`,
                                        transition: 'box-shadow 0.2s',
                                        '&:hover': { boxShadow: 6 },
                                    }}
                                >
                                    <CardActionArea onClick={() => navigate(`/student/assignment/${a.id}`)}>
                                        <CardContent>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Box flex={1}>
                                                    <Typography variant="h6">{a.title}</Typography>
                                                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                                                        {a.description || 'Опис відсутній'}
                                                    </Typography>
                                                    <Box mt={1.5} display="flex" gap={1} flexWrap="wrap">
                                                        <Chip
                                                            label={`Дедлайн: ${formatDate(a.dueDate)}`}
                                                            size="small"
                                                            variant="outlined"
                                                            color={overdue ? 'error' : 'primary'}
                                                        />
                                                        {submitted && (
                                                            <Chip
                                                                label={graded ? `Оцінка: ${sub.grade}` : 'Здано ✓'}
                                                                size="small"
                                                                color={graded ? 'success' : 'info'}
                                                            />
                                                        )}
                                                        {!submitted && (
                                                            <Chip
                                                                label={overdue ? '⚠️ Прострочено' : 'Не здано'}
                                                                size="small"
                                                                color={overdue ? 'error' : 'warning'}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                                {submitted
                                                    ? <AssignmentTurnedInIcon color="success" sx={{ ml: 1 }} />
                                                    : <AssignmentLateIcon color={overdue ? 'error' : 'action'} sx={{ ml: 1 }} />}
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            );
                        })}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}
