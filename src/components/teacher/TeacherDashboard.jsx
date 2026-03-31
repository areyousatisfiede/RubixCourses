// src/components/teacher/TeacherDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Alert, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress,
    Container, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Grid, IconButton, InputAdornment, Skeleton, Snackbar,
    Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useAuth } from '../../context/AuthContext';
import {
    getAssignments,
    createAssignment,
    deleteAssignment,
    getSubmissionsForAssignment,
    getClassesByTeacher,
    createNewClass,
    createNotification,
    fileUrl,
} from '../../api/endpoints';
import { FormControl, InputLabel, MenuItem, Select, Tab, Tabs } from '@mui/material';
import ClassCodeCard from './ClassCodeCard';

const MOON = '#7EACB5';
const GUN = '#1B242A';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(''); // '' means All Classes
    const [loading, setLoading] = useState(true);
    const [submissionCounts, setSubmissionCounts] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', dueDate: '', classId: '' });
    const [files, setFiles] = useState([]); // прикріплені файли
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
    const [classDialogOpen, setClassDialogOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [creatingClass, setCreatingClass] = useState(false);

    const refresh = useCallback(async () => {
        if (!user) return;
        try {
            const [list, classList] = await Promise.all([
                getAssignments(user._id, selectedClassId),
                getClassesByTeacher(user._id)
            ]);
            setAssignments(list);
            setClasses(classList);

            // If we have selected a class that no longer exists, reset it
            if (selectedClassId && !classList.find(c => c._id === selectedClassId)) {
                setSelectedClassId('');
            }

            const counts = {};
            await Promise.all(list.map(async (a) => {
                const subs = await getSubmissionsForAssignment(a._id);
                counts[a._id] = subs.length;
            }));
            setSubmissionCounts(counts);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user, selectedClassId]);

    useEffect(() => { refresh(); }, [refresh]);

    const handleCreate = async () => {
        if (!form.title.trim() || !form.classId) return;
        setCreating(true);
        try {
            await createAssignment({
                title: form.title.trim(),
                description: form.description,
                dueDate: form.dueDate || undefined,
                createdBy: user._id,
                classId: form.classId,
            }, files);
            setForm({ title: '', description: '', dueDate: '', classId: selectedClassId || '' });
            setFiles([]);
            setDialogOpen(false);
            setSnack({ open: true, msg: '✓ Завдання створено!', severity: 'success' });
            refresh();
        } catch (e) {
            setSnack({ open: true, msg: e.message, severity: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        try {
            await deleteAssignment(id);
            setSnack({ open: true, msg: 'Завдання видалено', severity: 'info' });
            refresh();
        } catch (e) {
            setSnack({ open: true, msg: e.message, severity: 'error' });
        } finally {
            setDeleting(null);
        }
    };

    const handleCreateClass = async () => {
        if (!newClassName.trim()) return;
        setCreatingClass(true);
        try {
            await createNewClass(user._id, user.displayName || user.email, newClassName.trim());
            setNewClassName('');
            setClassDialogOpen(false);
            setSnack({ open: true, msg: '✓ Клас успішно створено!', severity: 'success' });
            refresh();
        } catch (e) {
            setSnack({ open: true, msg: e.message, severity: 'error' });
        } finally {
            setCreatingClass(false);
        }
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb', pt: 6 }}>
                <Container maxWidth="lg">
                    <Stack spacing={3}>
                        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 4 }} />
                        <Grid container spacing={2}>
                            {[1, 2, 3].map(i => (
                                <Grid item xs={12} sm={6} md={4} key={i}>
                                    <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Stack>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={3}>
                    {/* Код класу */}
                    <Grid item xs={12} md={4}>
                        <ClassCodeCard classId={selectedClassId} onClassCreated={() => setClassDialogOpen(true)} />
                    </Grid>

                    {/* Завдання */}
                    <Grid item xs={12} md={8}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h5" fontWeight={800} color={GUN}>
                                Завдання
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setForm(prev => ({ ...prev, classId: selectedClassId || '' }));
                                    setDialogOpen(true);
                                }}
                                sx={{
                                    bgcolor: MOON, fontWeight: 700, borderRadius: 3, px: 3,
                                    '&:hover': { bgcolor: '#5F8F99' },
                                }}
                            >
                                Нове завдання
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

                        {assignments.length === 0 ? (
                            <Card sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
                                <DescriptionIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    Поки що немає завдань
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Створіть перше завдання {selectedClassId ? 'для цього класу' : 'для ваших студентів'}
                                </Typography>
                                <Button variant="outlined" onClick={() => setDialogOpen(true)}>
                                    Створити завдання
                                </Button>
                            </Card>
                        ) : (
                            <Grid container spacing={2}>
                                {assignments.map((a) => (
                                    <Grid item xs={12} sm={6} key={a._id}>
                                        <Card
                                            sx={{
                                                borderRadius: 3,
                                                border: '1px solid #e2e8f0',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: MOON,
                                                    boxShadow: `0 4px 20px ${MOON}22`,
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ pb: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography variant="h6" fontWeight={700} color={GUN} noWrap sx={{ flex: 1 }}>
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
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    {a.dueDate && (
                                                        <Chip
                                                            icon={<CalendarTodayIcon sx={{ fontSize: '0.85rem !important' }} />}
                                                            label={new Date(a.dueDate).toLocaleDateString('uk-UA')}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: 12 }}
                                                        />
                                                    )}
                                                    <Chip
                                                        label={`${submissionCounts[a._id] || 0} здач`}
                                                        size="small"
                                                        sx={{ bgcolor: `${MOON}15`, color: MOON, fontWeight: 600, fontSize: 12 }}
                                                    />
                                                    {a.attachments?.length > 0 && (
                                                        <Chip
                                                            icon={<AttachFileIcon sx={{ fontSize: '0.85rem !important' }} />}
                                                            label={`${a.attachments.length} файл(ів)`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: 12 }}
                                                        />
                                                    )}
                                                </Stack>
                                            </CardContent>
                                            <Divider />
                                            <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                                                <Button
                                                    component={RouterLink}
                                                    to={`/teacher/assignment/${a._id}`}
                                                    size="small"
                                                    sx={{ color: MOON, fontWeight: 600 }}
                                                >
                                                    Переглянути
                                                </Button>
                                                <Tooltip title="Видалити завдання">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        disabled={deleting === a._id}
                                                        onClick={() => handleDelete(a._id)}
                                                    >
                                                        {deleting === a._id ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Container>

            {/* Діалог створення завдання */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 700 }}>Нове завдання</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <FormControl fullWidth required>
                            <InputLabel id="class-select-label">Виберіть клас</InputLabel>
                            <Select
                                labelId="class-select-label"
                                value={form.classId}
                                label="Виберіть клас"
                                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                            >
                                {classes.map(c => (
                                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            autoFocus
                            label="Назва завдання"
                            fullWidth
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            inputProps={{ maxLength: 120 }}
                        />
                        <TextField
                            label="Опис"
                            fullWidth
                            multiline
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <TextField
                            label="Дедлайн"
                            type="date"
                            fullWidth
                            value={form.dueDate}
                            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<AttachFileIcon />}
                            sx={{ borderColor: MOON, color: MOON }}
                        >
                            Прикріпити файли
                            <input type="file" hidden multiple onChange={handleFileChange} />
                        </Button>
                        {files.length > 0 && (
                            <Stack spacing={0.5}>
                                {files.map((f, i) => (
                                    <Typography key={i} variant="caption" color="text.secondary">
                                        📎 {f.name}
                                    </Typography>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={creating}>
                        Скасувати
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={!form.title.trim() || !form.classId || creating}
                        startIcon={creating ? <CircularProgress size={16} /> : null}
                        sx={{ bgcolor: MOON, '&:hover': { bgcolor: '#5F8F99' } }}
                    >
                        Створити
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Діалог створення класу */}
            <Dialog open={classDialogOpen} onClose={() => setClassDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 700 }}>Створити новий клас</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Назва класу"
                        fullWidth
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateClass();
                        }}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClassDialogOpen(false)} disabled={creatingClass}>
                        Скасувати
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateClass}
                        disabled={!newClassName.trim() || creatingClass}
                        startIcon={creatingClass ? <CircularProgress size={16} /> : null}
                        sx={{ bgcolor: MOON, '&:hover': { bgcolor: '#5F8F99' } }}
                    >
                        Створити
                    </Button>
                </DialogActions>
            </Dialog>

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
