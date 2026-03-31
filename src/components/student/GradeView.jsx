// src/components/student/GradeView.jsx
import React, { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Chip, CircularProgress, Container,
    Grid, Stack, Typography, LinearProgress,
} from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ReplyIcon from '@mui/icons-material/Reply';
import { useAuth } from '../../context/AuthContext';
import {
    getAssignments,
    getSubmissionsForStudent,
} from '../../api/endpoints';

const MOON = '#7EACB5';
const GUN = '#1B242A';

export default function GradeView() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [list, subs] = await Promise.all([
                    getAssignments(),
                    getSubmissionsForStudent(user._id),
                ]);
                setAssignments(list);
                const subMap = {};
                subs.forEach(s => { subMap[s.assignmentId] = s; });
                setSubmissions(subMap);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
                <CircularProgress sx={{ color: MOON }} />
            </Box>
        );
    }

    const graded = assignments.filter(a => submissions[a._id]?.grade != null);
    const avgGrade = graded.length
        ? Math.round(graded.reduce((sum, a) => sum + (submissions[a._id]?.grade || 0), 0) / graded.length)
        : null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h5" fontWeight={800} color={GUN} mb={1}>
                    Мої оцінки
                </Typography>
                {avgGrade !== null && (
                    <Typography variant="body1" color="text.secondary" mb={3}>
                        Середній бал: <strong>{avgGrade}</strong> · Оцінено: {graded.length} / {assignments.length}
                    </Typography>
                )}

                <Grid container spacing={2}>
                    {assignments.map((a) => {
                        const sub = submissions[a._id];
                        return (
                            <Grid item xs={12} sm={6} md={4} key={a._id}>
                                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight={700} color={GUN} gutterBottom noWrap>
                                            {a.title}
                                        </Typography>

                                        {sub ? (
                                            <>
                                                {sub.grade != null ? (
                                                    <>
                                                        <Typography variant="h3" fontWeight={800} color={MOON} mb={0.5}>
                                                            {sub.grade}
                                                        </Typography>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={sub.grade}
                                                            sx={{
                                                                height: 6, borderRadius: 3, mb: 1.5,
                                                                bgcolor: `${MOON}15`,
                                                                '& .MuiLinearProgress-bar': { bgcolor: MOON },
                                                            }}
                                                        />
                                                        <Chip
                                                            icon={sub.status === 'returned' ? <ReplyIcon /> : <CheckCircleIcon />}
                                                            label={sub.status === 'returned' ? 'Повернуто' : 'Оцінено'}
                                                            size="small"
                                                            color={sub.status === 'returned' ? 'success' : 'primary'}
                                                            sx={{ fontWeight: 600 }}
                                                        />
                                                        {sub.comment && (
                                                            <Box sx={{ bgcolor: '#f0f4f8', borderRadius: 1.5, p: 1.5, mt: 1.5 }}>
                                                                <Typography variant="caption" fontWeight={700}>💬 Коментар:</Typography>
                                                                <Typography variant="body2" fontSize={13}>
                                                                    {sub.comment}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Stack direction="row" alignItems="center" spacing={1} mt={2}>
                                                        <PendingIcon sx={{ color: '#ED8936' }} />
                                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                            Очікує перевірки
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" mt={2}>
                                                Не здано
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>
        </Box>
    );
}
