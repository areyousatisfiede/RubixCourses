// src/components/student/GradeView.jsx
// Перегляд усіх оцінок та коментарів студента

import React, { useEffect, useState } from 'react';
import {
    Alert, Box, Card, CardContent, Chip, CircularProgress,
    Container, Divider, LinearProgress, Stack, Typography,
} from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../../context/AuthContext';
import { getAssignments, getSubmissionsForStudent } from '../../firebase/firestoreHelpers';

const MOON = '#7EACB5';
const MOON_D = '#5F8F99';
const BANNER = '#2D3748';
const BANNER_D = '#1e2a38';
const GUN = '#1B242A';
const CHAMP = '#F5E4C8';

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
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <GradeIcon sx={{ fontSize: 34, color: MOON }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: GUN }}>Мої оцінки</Typography>
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
                            background: `linear-gradient(135deg, ${BANNER_D} 0%, ${BANNER} 100%)`,
                            color: 'white',
                            border: '1px solid rgba(126,172,181,0.2)',
                        }}
                    >
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <EmojiEventsIcon sx={{ fontSize: 48, color: MOON }} />
                                <Box>
                                    <Typography variant="h3" fontWeight={800} sx={{ color: CHAMP }}>{average}</Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(245,228,200,0.7)' }}>
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
                                        ? `4px solid ${row.grade >= 90 ? '#38A169' : row.grade >= 70 ? MOON_D : row.grade >= 50 ? '#D69E2E' : '#E53E3E'}`
                                        : '4px solid #CBD5E0',
                                }}
                            >
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Typography variant="h6" flex={1} sx={{ color: GUN }}>{row.assignmentTitle}</Typography>
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

                                    {row.grade != null && (
                                        <Box mt={1.5}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={row.grade}
                                                sx={{
                                                    height: 6, borderRadius: 3,
                                                    bgcolor: '#EDF2F7',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: row.grade >= 90 ? '#38A169' : row.grade >= 70 ? MOON_D : row.grade >= 50 ? '#D69E2E' : '#E53E3E',
                                                    },
                                                }}
                                            />
                                        </Box>
                                    )}

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
