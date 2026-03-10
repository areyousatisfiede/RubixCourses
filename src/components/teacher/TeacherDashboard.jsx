// src/components/teacher/TeacherDashboard.jsx
// Головна панель викладача: список завдань + статистика

import React, { useEffect, useState } from 'react';
import {
    Box, Button, Card, CardContent, CircularProgress, Container,
    Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, IconButton, MenuItem, Stack, TextField,
    Tooltip, Typography, Alert, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
} from '../../firebase/firestoreHelpers';
import Navbar from '../shared/Navbar';

// ─── Форма для додавання / редагування завдання ─────────────────────────────
function AssignmentForm({ open, onClose, onSave, initial }) {
    const [title, setTitle] = useState(initial?.title || '');
    const [description, setDescription] = useState(initial?.description || '');
    const [dueDate, setDueDate] = useState(
        initial?.dueDate ? new Date(initial.dueDate.seconds * 1000).toISOString().slice(0, 10) : ''
    );

    useEffect(() => {
        if (open) {
            setTitle(initial?.title || '');
            setDescription(initial?.description || '');
            setDueDate(
                initial?.dueDate
                    ? new Date(initial.dueDate.seconds * 1000).toISOString().slice(0, 10)
                    : ''
            );
        }
    }, [open, initial]);

    function handleSave() {
        if (!title.trim()) return;
        onSave({ title: title.trim(), description: description.trim(), dueDate: new Date(dueDate) });
        onClose();
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initial ? 'Редагувати завдання' : 'Нове завдання'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField label="Назва" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} />
                    <TextField
                        label="Опис"
                        fullWidth multiline rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        label="Дедлайн"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Скасувати</Button>
                <Button variant="contained" onClick={handleSave} disabled={!title.trim()}>
                    Зберегти
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Головний дашборд ────────────────────────────────────────────────────────
export default function TeacherDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);       // { id, ...data } або null
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [error, setError] = useState('');

    async function load() {
        setLoading(true);
        try {
            const data = await getAssignments();
            setAssignments(data);
        } catch (e) {
            setError('Помилка завантаження даних');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleSave(data) {
        try {
            if (editing) {
                await updateAssignment(editing.id, data);
            } else {
                await createAssignment({ ...data, createdBy: user.uid });
            }
            await load();
        } catch (e) {
            setError('Помилка збереження');
        }
    }

    async function handleDelete(id) {
        try {
            await deleteAssignment(id);
            setDeleteTarget(null);
            await load();
        } catch (e) {
            setError('Помилка видалення');
        }
    }

    function formatDate(ts) {
        if (!ts) return '—';
        const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
        return d.toLocaleDateString('uk-UA');
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Заголовок + кнопка */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4">Панель викладача</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Керуйте завданнями та переглядайте роботи студентів
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => { setEditing(null); setFormOpen(true); }}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Нове завдання
                    </Button>
                </Stack>

                {/* Статистика */}
                <Grid container spacing={2} mb={4}>
                    {[
                        { label: 'Всього завдань', value: assignments.length, color: '#5c6bc0' },
                        {
                            label: 'Завдань з дедлайном сьогодні',
                            value: assignments.filter((a) => {
                                if (!a.dueDate) return false;
                                const d = a.dueDate.seconds ? new Date(a.dueDate.seconds * 1000) : new Date(a.dueDate);
                                return d.toDateString() === new Date().toDateString();
                            }).length,
                            color: '#ef5350',
                        },
                    ].map((stat) => (
                        <Grid item xs={12} sm={6} md={3} key={stat.label}>
                            <Card sx={{ borderLeft: `4px solid ${stat.color}` }}>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                                    <Typography variant="h4" sx={{ color: stat.color }}>{stat.value}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Список завдань */}
                {loading ? (
                    <Box textAlign="center" py={6}><CircularProgress /></Box>
                ) : assignments.length === 0 ? (
                    <Card sx={{ textAlign: 'center', py: 6 }}>
                        <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Завдань ще немає. Додайте перше!</Typography>
                    </Card>
                ) : (
                    <Stack spacing={2}>
                        {assignments.map((a) => (
                            <Card key={a.id} sx={{ transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }}>
                                <CardContent>
                                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                                        <Box flex={1}>
                                            <Typography variant="h6">{a.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                                {a.description || 'Опис відсутній'}
                                            </Typography>
                                            <Box mt={1}>
                                                <Chip
                                                    label={`Дедлайн: ${formatDate(a.dueDate)}`}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            </Box>
                                        </Box>
                                        <Stack direction="row" spacing={0.5}>
                                            <Tooltip title="Переглянути — оцінити роботи">
                                                <IconButton color="primary" onClick={() => navigate(`/teacher/assignment/${a.id}`)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Редагувати">
                                                <IconButton onClick={() => { setEditing(a); setFormOpen(true); }}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Видалити">
                                                <IconButton color="error" onClick={() => setDeleteTarget(a.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Container>

            {/* Форма додавання/редагування */}
            <AssignmentForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSave={handleSave}
                initial={editing}
            />

            {/* Підтвердження видалення */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Видалити завдання?</DialogTitle>
                <DialogContent>
                    <Typography>Цю дію неможливо скасувати.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Скасувати</Button>
                    <Button color="error" variant="contained" onClick={() => handleDelete(deleteTarget)}>
                        Видалити
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
