// src/components/student/StudentDashboard.jsx
// Головна панель студента: список завдань зі статусами

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert, Box, Button, Card, CardActionArea, CardContent,
    Chip, CircularProgress, Container, LinearProgress, Stack, Typography,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import GradeIcon from '@mui/icons-material/Grade';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../../context/AuthContext';
import { getAssignments, getSubmissionsForStudent, subscribeClassForStudent } from '../../firebase/firestoreHelpers';
import JoinClassModal from './JoinClassModal';

const MOON = '#7EACB5';
const MOON_D = '#5F8F99';
const GUN = '#1B242A';

export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);   // submissions поточного студента
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [joinOpen, setJoinOpen] = useState(false);
    const [myClass, setMyClass] = useState(undefined); // undefined = not loaded yet, null = no class

    // Підписуємось на клас студента
    useEffect(() => {
        if (!user) return;
        const unsub = subscribeClassForStudent(user.uid, (cls) => {
            setMyClass(cls);
        });
        return () => unsub();
    }, [user.uid]);

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
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: GUN }}>Мої завдання</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Всього: {assignments.length} | Здано: {submissions.length}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        {(myClass === null || myClass === undefined) && (
                            <Button
                                variant="outlined"
                                startIcon={<GroupAddIcon />}
                                onClick={() => setJoinOpen(true)}
                                sx={{ borderRadius: 2, borderColor: '#7EACB5', color: '#5F8F99' }}
                            >
                                Приєднатись до класу
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<GradeIcon />}
                            onClick={() => navigate('/student/grades')}
                            color="primary"
                        >
                            Переглянути оцінки
                        </Button>
                    </Stack>
                </Stack>

                {/* Банер класу */}
                {myClass && (
                    <Box mb={2.5} p={2} sx={{
                        bgcolor: '#1B242A',
                        border: '1.5px solid #7EACB544',
                        borderRadius: 3,
                        display: 'flex', alignItems: 'center', gap: 1.5,
                    }}>
                        <SchoolIcon sx={{ color: '#7EACB5', fontSize: 22 }} />
                        <Box>
                            <Typography variant="body2" sx={{ color: '#C4D9E3', fontWeight: 700 }}>
                                {myClass.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#7EACB5' }}>
                                Ви є учасником цього класу
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Загальний прогрес */}
                {assignments.length > 0 && (
                    <Box mb={3} p={2.5} sx={{ bgcolor: `${MOON}12`, border: `1px solid ${MOON}40`, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ color: GUN }}>Загальний прогрес</Typography>
                            <Typography variant="body2" sx={{ color: MOON_D, fontWeight: 700 }}>
                                {submissions.length} / {assignments.length}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={assignments.length ? (submissions.length / assignments.length) * 100 : 0}
                            sx={{ height: 8, borderRadius: 4, bgcolor: `${MOON}25`, '& .MuiLinearProgress-bar': { bgcolor: MOON } }}
                        />
                    </Box>
                )}

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
                        {[...assignments].sort((a, b) => {
                            const subA = getSubmission(a.id);
                            const subB = getSubmission(b.id);
                            const overdueA = !subA && isOverdue(a.dueDate);
                            const overdueB = !subB && isOverdue(b.dueDate);
                            if (overdueA && !overdueB) return -1;
                            if (!overdueA && overdueB) return 1;
                            if (!subA && subB) return -1;
                            if (subA && !subB) return 1;
                            return 0;
                        }).map((a) => {
                            const sub = getSubmission(a.id);
                            const submitted = !!sub;
                            const graded = sub?.grade != null;
                            const overdue = !submitted && isOverdue(a.dueDate);
                            const borderColor = submitted ? '#38A169' : overdue ? '#E53E3E' : MOON_D;

                            return (
                                <Card
                                    key={a.id}
                                    sx={{
                                        borderLeft: `4px solid ${borderColor}`,
                                        transition: 'box-shadow 0.2s',
                                        '&:hover': { boxShadow: 6 },
                                    }}
                                >
                                    <CardActionArea onClick={() => navigate(`/student/assignment/${a.id}`)}>
                                        <CardContent>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Box flex={1}>
                                                    <Typography variant="h6" sx={{ color: GUN }}>{a.title}</Typography>
                                                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                                                        {a.description || 'Опис відсутній'}
                                                    </Typography>
                                                    <Box mt={1.5} display="flex" gap={1} flexWrap="wrap">
                                                        <Chip
                                                            label={`Дедлайн: ${formatDate(a.dueDate)}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: `${overdue ? '#E53E3E' : MOON_D}15`,
                                                                color: overdue ? '#E53E3E' : MOON_D,
                                                                border: `1px solid ${overdue ? '#E53E3E' : MOON_D}40`,
                                                                fontWeight: 600,
                                                            }}
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

            <JoinClassModal
                open={joinOpen}
                onClose={() => setJoinOpen(false)}
                studentId={user.uid}
                onJoined={(cls) => setMyClass(cls)}
            />
        </Box>
    );
}
