// src/components/student/StudentDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, Stack, TextField, Typography, Alert, Snackbar, Tabs, Tab
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useAuth } from '../../context/AuthContext';
import {
    getAssignments,
    getSubmissionsForStudent,
    subscribeClassesForStudent,
    getClassByCode,
    joinClass,
    fileUrl,
} from '../../api/endpoints';

const MOON = '#7EACB5';
const GUN = '#1B242A';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [loading, setLoading] = useState(true);
    const [joinOpen, setJoinOpen] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const refresh = useCallback(async () => {
        if (!user) return;
        try {
            const [list, subs] = await Promise.all([
                getAssignments(null, selectedClassId),
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
    }, [user, selectedClassId]);

    useEffect(() => { refresh(); }, [refresh]);

    // Підписка на класи
    useEffect(() => {
        if (!user) return;
        const unsub = subscribeClassesForStudent(user._id, (classList) => {
            setClasses(classList || []);
            // Якщо обраний клас більше не існує, скидаємо вибір
            if (selectedClassId && !(classList || []).find(c => c._id === selectedClassId)) {
                setSelectedClassId('');
            }
        });
        return () => unsub();
    }, [user, selectedClassId]);

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        setJoining(true);
        try {
            const cls = await getClassByCode(joinCode.trim());
            await joinClass(cls._id, user._id);
            setSnack({ open: true, msg: `✓ Ви приєднались до класу «${cls.name}»`, severity: 'success' });
            setJoinOpen(false);
            setJoinCode('');
        } catch (e) {
            setSnack({ open: true, msg: e.message || 'Клас не знайдено', severity: 'error' });
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
                <CircularProgress sx={{ color: MOON }} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box>
                        <Typography variant="h5" fontWeight={800} color={GUN}>
                            Мої завдання
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        onClick={() => setJoinOpen(true)}
                        sx={{ borderColor: MOON, color: MOON, fontWeight: 600 }}
                    >
                        Приєднатись до класу
                    </Button>
                </Stack>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={selectedClassId}
                        onChange={(e, val) => setSelectedClassId(val)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minWidth: 100 },
                            '& .Mui-selected': { color: MOON },
                            '& .MuiTabs-indicator': { bgcolor: MOON }
                        }}
                    >
                        <Tab label="Усі класи" value="" />
                        {classes.map(c => (
                            <Tab key={c._id} label={c.name} value={c._id} />
                        ))}
                    </Tabs>
                </Box>

                {/* Assignments */}
                {assignments.length === 0 ? (
                    <Card sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
                        <AssignmentIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Поки що немає завдань
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Приєднайтесь до класу за кодом від викладача
                        </Typography>
                    </Card>
                ) : (
                    <Grid container spacing={2}>
                        {assignments.map((a) => {
                            const sub = submissions[a._id];
                            const statusLabel = sub
                                ? sub.status === 'returned' ? 'Повернуто з оцінкою'
                                    : sub.status === 'graded' ? `Оцінено: ${sub.grade}`
                                        : 'Здано'
                                : 'Не здано';
                            const statusColor = sub
                                ? sub.status === 'returned' ? 'success'
                                    : sub.status === 'graded' ? 'primary'
                                        : 'info'
                                : 'default';

                            return (
                                <Grid item xs={12} sm={6} md={4} key={a._id}>
                                    <Card sx={{
                                        borderRadius: 3, border: '1px solid #e2e8f0',
                                        transition: 'all 0.2s',
                                        '&:hover': { borderColor: MOON, boxShadow: `0 4px 20px ${MOON}22` },
                                    }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Typography variant="h6" fontWeight={700} color={GUN} gutterBottom noWrap sx={{ flex: 1 }}>
                                                    {a.title}
                                                </Typography>
                                                {classes.find(c => c._id === a.classId) && (
                                                    <Chip
                                                        label={classes.find(c => c._id === a.classId).name}
                                                        size="small"
                                                        sx={{ ml: 1, bgcolor: `${MOON}10`, color: MOON, height: 20, fontSize: 10 }}
                                                    />
                                                )}
                                            </Box>
                                            {a.description && (
                                                <Typography variant="body2" color="text.secondary" sx={{
                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden', mb: 1.5,
                                                }}>
                                                    {a.description}
                                                </Typography>
                                            )}
                                            <Stack direction="row" spacing={1} flexWrap="wrap" mb={1.5}>
                                                {a.dueDate && (
                                                    <Chip
                                                        icon={<CalendarTodayIcon sx={{ fontSize: '0.85rem !important' }} />}
                                                        label={new Date(a.dueDate).toLocaleDateString('uk-UA')}
                                                        size="small" variant="outlined" sx={{ fontSize: 12 }}
                                                    />
                                                )}
                                                <Chip
                                                    label={statusLabel}
                                                    size="small"
                                                    color={statusColor}
                                                    icon={sub ? <CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} /> : undefined}
                                                    sx={{ fontSize: 12, fontWeight: 600 }}
                                                />
                                                {a.attachments?.length > 0 && (
                                                    <Chip
                                                        icon={<AttachFileIcon sx={{ fontSize: '0.85rem !important' }} />}
                                                        label={`${a.attachments.length} файл(ів)`}
                                                        size="small" variant="outlined" sx={{ fontSize: 12 }}
                                                    />
                                                )}
                                            </Stack>
                                            <Button
                                                component={RouterLink}
                                                to={`/student/assignment/${a._id}`}
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                sx={{ borderColor: MOON, color: MOON, fontWeight: 600 }}
                                            >
                                                {sub ? 'Переглянути' : 'Здати роботу'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Container>

            {/* Join class dialog */}
            <Dialog open={joinOpen} onClose={() => setJoinOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Приєднатись до класу</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus fullWidth label="Код класу"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        sx={{ mt: 1 }}
                        inputProps={{ maxLength: 6, style: { letterSpacing: 4, fontFamily: 'monospace', textAlign: 'center', fontSize: 20 } }}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setJoinOpen(false)} disabled={joining}>Скасувати</Button>
                    <Button
                        variant="contained" onClick={handleJoin}
                        disabled={joinCode.length < 6 || joining}
                        startIcon={joining ? <CircularProgress size={14} /> : null}
                        sx={{ bgcolor: MOON, '&:hover': { bgcolor: '#5F8F99' } }}
                    >
                        Приєднатись
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open} autoHideDuration={3000}
                onClose={() => setSnack(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
