// src/components/student/AssignmentDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Divider, Snackbar, Stack, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../context/AuthContext';
import {
    getAssignmentById,
    getSubmission,
    submitWork,
    fileUrl,
} from '../../api/endpoints';
import SubmissionComments from '../shared/SubmissionComments';

const MOON = '#7EACB5';
const GUN = '#1B242A';

export default function AssignmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    useEffect(() => {
        async function load() {
            try {
                const [a, sub] = await Promise.all([
                    getAssignmentById(id),
                    getSubmission(id, user._id),
                ]);
                setAssignment(a);
                setSubmission(sub);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, user]);

    const handleSubmit = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const sub = await submitWork(id, user._id, file);
            setSubmission(sub);
            setFile(null);
            setSnack({ open: true, msg: '✓ Роботу здано!', severity: 'success' });
        } catch (e) {
            setSnack({ open: true, msg: e.message, severity: 'error' });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
                <CircularProgress sx={{ color: MOON }} />
            </Box>
        );
    }

    if (!assignment) {
        return (
            <Container maxWidth="md" sx={{ pt: 6 }}>
                <Typography>Завдання не знайдено</Typography>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fb', pb: 8 }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/student')}
                    sx={{ mb: 2, color: GUN, fontWeight: 600 }}
                >
                    Назад
                </Button>

                {/* Assignment info */}
                <Card sx={{ borderRadius: 3, mb: 3 }}>
                    <CardContent>
                        <Typography variant="h5" fontWeight={800} color={GUN} gutterBottom>
                            {assignment.title}
                        </Typography>
                        {assignment.description && (
                            <Typography variant="body1" color="text.secondary" mb={2}>
                                {assignment.description}
                            </Typography>
                        )}
                        <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                            {assignment.dueDate && (
                                <Chip label={`Дедлайн: ${new Date(assignment.dueDate).toLocaleDateString('uk-UA')}`} size="small" variant="outlined" />
                            )}
                        </Stack>

                        {/* Assignment attachments */}
                        {assignment.attachments?.length > 0 && (
                            <Box mt={2}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    📎 Матеріали від викладача:
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {assignment.attachments.map((att, i) => (
                                        <Chip
                                            key={i}
                                            icon={<AttachFileIcon />}
                                            label={att.filename}
                                            component="a"
                                            href={fileUrl(att.url)}
                                            target="_blank"
                                            clickable
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Submission status */}
                {submission ? (
                    <Card sx={{ borderRadius: 3, mb: 3, border: `2px solid ${submission.status === 'returned' ? '#48BB78' : MOON}` }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CheckCircleIcon sx={{ color: submission.status === 'returned' ? '#48BB78' : MOON }} />
                                    <Typography variant="h6" fontWeight={700} color={GUN}>
                                        {submission.status === 'returned' ? 'Роботу повернуто з оцінкою' :
                                            submission.status === 'graded' ? 'Роботу оцінено' : 'Роботу здано'}
                                    </Typography>
                                </Stack>
                                <Chip
                                    label={
                                        submission.status === 'returned' ? 'Повернуто' :
                                            submission.status === 'graded' ? 'Оцінено' : 'Очікує перевірки'
                                    }
                                    color={submission.status === 'returned' ? 'success' : submission.status === 'graded' ? 'primary' : 'default'}
                                    size="small"
                                />
                            </Stack>

                            {submission.grade != null && (
                                <Typography variant="h4" fontWeight={800} color={MOON} mb={1}>
                                    {submission.grade} / 100
                                </Typography>
                            )}
                            {submission.comment && (
                                <Box sx={{ bgcolor: '#f7f9fb', borderRadius: 2, p: 2, mb: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                        💬 Коментар викладача:
                                    </Typography>
                                    <Typography variant="body2">{submission.comment}</Typography>
                                </Box>
                            )}

                            {/* Submitted files */}
                            {submission.fileURL && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    component="a"
                                    href={fileUrl(submission.fileURL)}
                                    target="_blank"
                                    startIcon={<AttachFileIcon />}
                                    sx={{ mt: 1, borderColor: MOON, color: MOON }}
                                >
                                    Мій файл
                                </Button>
                            )}

                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                Здано: {new Date(submission.createdAt).toLocaleString('uk-UA')}
                            </Typography>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Submit work */}
                <Card sx={{ borderRadius: 3, mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700} color={GUN} gutterBottom>
                            {submission ? 'Перездати роботу' : 'Здати роботу'}
                        </Typography>
                        <Stack spacing={2}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadFileIcon />}
                                sx={{ borderColor: MOON, color: MOON }}
                            >
                                Обрати файл
                                <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
                            </Button>
                            {file && (
                                <Typography variant="body2" color="text.secondary">
                                    📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={!file || uploading}
                                startIcon={uploading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                                sx={{ bgcolor: MOON, '&:hover': { bgcolor: '#5F8F99' } }}
                            >
                                {submission ? 'Перездати' : 'Здати роботу'}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Comments */}
                {submission && (
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <SubmissionComments
                                submissionId={submission._id}
                                assignmentId={id}
                            />
                        </CardContent>
                    </Card>
                )}
            </Container>

            <Snackbar
                open={snack.open} autoHideDuration={3000}
                onClose={() => setSnack(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
