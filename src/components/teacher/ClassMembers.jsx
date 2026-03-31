import React, { useEffect, useMemo, useState } from 'react';
import {
    Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Button,
    Card, CardContent, Chip, CircularProgress, Container, Dialog,
    DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack,
    TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../../context/AuthContext';
import {
    createNewClass,
    createNotification,
    deleteClass,
    getAllStudents,
    getAssignments,
    getSubmissionsForAssignment,
    removeStudentFromClass,
    subscribeClassesForTeacher,
    updateClassName,
} from '../../api/endpoints';

const MOON = '#7EACB5';
const GUN = '#1B242A';

export default function ClassMembers() {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [stats, setStats] = useState({});
    const [totalAsgn, setTotalAsgn] = useState(0);
    const [loading, setLoading] = useState(true);
    const [kickingId, setKickingId] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [editClass, setEditClass] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeClassesForTeacher(user._id, (data) => {
            setClasses(data);
        });
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        async function loadStats() {
            try {
                const [students, assignments] = await Promise.all([
                    getAllStudents(),
                    getAssignments(),
                ]);
                setAllStudents(students);
                setTotalAsgn(assignments.length);

                const submissions = (
                    await Promise.all(assignments.map((a) => getSubmissionsForAssignment(a._id)))
                ).flat();

                const nextStats = {};
                students.forEach((student) => {
                    const mine = submissions.filter((sub) => sub.studentId === student._id);
                    const graded = mine.filter((sub) => sub.grade != null);
                    const avg = graded.length
                        ? Math.round(graded.reduce((acc, sub) => acc + sub.grade, 0) / graded.length)
                        : null;
                    nextStats[student._id] = { submitted: mine.length, graded: graded.length, avg };
                });
                setStats(nextStats);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    const classesWithStudents = useMemo(
        () =>
            classes.map((cls) => ({
                ...cls,
                students: allStudents.filter((s) => cls.studentIds?.includes(s._id)),
            })),
        [classes, allStudents]
    );

    async function handleCreateClass() {
        if (!newClassName.trim()) return;
        await createNewClass(user._id, user.displayName || user.email, newClassName.trim());
        setNewClassName('');
        setCreateOpen(false);
    }

    async function handleRenameClass() {
        if (!editClass || !newClassName.trim()) return;
        await updateClassName(editClass._id, newClassName.trim());
        setEditClass(null);
        setNewClassName('');
    }

    async function handleDeleteClass() {
        if (!deleteConfirm) return;
        await deleteClass(deleteConfirm._id);
        setDeleteConfirm(null);
    }

    async function handleKick(classId, className, studentId) {
        setKickingId(studentId);
        try {
            await removeStudentFromClass(classId, studentId);
            await createNotification(studentId, 'system', classId, `Вас відрахували з класу «${className}»`);
        } finally {
            setKickingId(null);
        }
    }

    function handleCopyCode(code) {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    }

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', pt: 8 }}>
                <CircularProgress sx={{ color: MOON }} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} color={GUN}>Класи та студенти</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Оберіть клас, щоб переглянути його студентів
                        </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                        Створити клас
                    </Button>
                </Stack>

                {classesWithStudents.length === 0 ? (
                    <Card sx={{ textAlign: 'center', py: 8 }}>
                        <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">У вас ще немає створених класів</Typography>
                        <Button variant="outlined" onClick={() => setCreateOpen(true)} sx={{ mt: 2 }}>
                            Створити перший клас
                        </Button>
                    </Card>
                ) : (
                    <Stack spacing={2}>
                        {classesWithStudents.map((cls) => (
                            <Accordion key={cls._id} sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
                                        <GroupsIcon sx={{ color: MOON }} />
                                        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                                            {cls.name}
                                        </Typography>
                                        <Chip label={`${cls.students.length} студентів`} size="small" variant="outlined" />
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                            Код: {cls.code}
                                        </Typography>
                                        <Tooltip title="Копіювати код">
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCopyCode(cls.code); }}>
                                                {copiedCode === cls.code ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditClass(cls); setNewClassName(cls.name); }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(cls); }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails sx={{ bgcolor: '#fafafa', p: 3 }}>
                                    {cls.students.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" align="center">
                                            У цьому класі поки немає студентів. Поділіться кодом <b>{cls.code}</b> для приєднання.
                                        </Typography>
                                    ) : (
                                        <Grid container spacing={2}>
                                            {cls.students.map((student) => {
                                                const st = stats[student._id] || { submitted: 0, graded: 0, avg: null };
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} key={student._id}>
                                                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                                    <Avatar sx={{ bgcolor: MOON, width: 36, height: 36, fontSize: 14 }}>
                                                                        {(student.displayName || student.email || '?')[0].toUpperCase()}
                                                                    </Avatar>
                                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                                                                            {student.displayName || 'Без імені'}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                                                                            {student.email}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Tooltip title="Відрахувати">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="error"
                                                                            disabled={kickingId === student._id}
                                                                            onClick={() => handleKick(cls._id, cls.name, student._id)}
                                                                        >
                                                                            {kickingId === student._id ? <CircularProgress size={16} /> : <PersonRemoveIcon fontSize="small" />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Stack>
                                                                <Stack direction="row" justifyContent="space-between" mt={1.5}>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary" display="block">Здано</Typography>
                                                                        <Typography variant="body2" fontWeight={700}>{st.submitted} / {totalAsgn}</Typography>
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary" display="block">Оцінено</Typography>
                                                                        <Typography variant="body2" fontWeight={700}>{st.graded}</Typography>
                                                                    </Box>
                                                                    <Box>
                                                                        <Typography variant="caption" color="text.secondary" display="block">Середній бал</Typography>
                                                                        <Typography variant="body2" fontWeight={700}>{st.avg ?? '—'}</Typography>
                                                                    </Box>
                                                                </Stack>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Stack>
                )}
            </Container>

            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Створити новий клас</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" label="Назва класу" fullWidth
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)}>Скасувати</Button>
                    <Button variant="contained" onClick={handleCreateClass} disabled={!newClassName.trim()}>
                        Створити
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(editClass)} onClose={() => setEditClass(null)} fullWidth maxWidth="xs">
                <DialogTitle>Перейменувати клас</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" label="Нова назва" fullWidth
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditClass(null)}>Скасувати</Button>
                    <Button variant="contained" onClick={handleRenameClass} disabled={!newClassName.trim()}>
                        Зберегти
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)}>
                <DialogTitle>Видалити клас?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Ви впевнені, що хочете видалити клас «{deleteConfirm?.name}»?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)}>Скасувати</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteClass}>
                        Видалити
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
