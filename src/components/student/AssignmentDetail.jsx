// src/components/student/AssignmentDetail.jsx
// Деталі завдання для студента: опис + завантаження файлу + статус

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Alert, Box, Button, Card, CardContent, Chip,
    CircularProgress, Container, Divider, Link,
    Stack, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../context/AuthContext';
import {
    getAssignments,
    getSubmissionsForStudent,
    submitWork,
} from '../../firebase/firestoreHelpers';
import SubmissionComments from '../shared/SubmissionComments';

export default function StudentAssignmentDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);   // поточний submission студента
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const [all, subs] = await Promise.all([
                    getAssignments(),
                    getSubmissionsForStudent(user.uid),
                ]);
                setAssignment(all.find((a) => a.id === id) || null);
                setSubmission(subs.find((s) => s.assignmentId === id) || null);
            } catch (e) {
                setError('Помилка завантаження');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, user.uid]);

    async function handleSubmit() {
        if (!selectedFile) return;
        setUploading(true);
        setError('');
        try {
            await submitWork(id, user.uid, selectedFile);
            setSuccess('Роботу успішно надіслано! ✓');
            setSelectedFile(null);
            // Оновлюємо submission
            const subs = await getSubmissionsForStudent(user.uid);
            setSubmission(subs.find((s) => s.assignmentId === id) || null);
        } catch (e) {
            setError('Помилка завантаження файлу');
        } finally {
            setUploading(false);
        }
    }

    if (loading) return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Box textAlign="center" pt={8}><CircularProgress /></Box>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student')} sx={{ mb: 2 }}>
                    До списку завдань
                </Button>

                {/* Деталі завдання */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>{assignment?.title}</Typography>
                        <Typography variant="body1" color="text.secondary">
                            {assignment?.description || 'Опис відсутній'}
                        </Typography>
                        {assignment?.dueDate && (
                            <Chip
                                label={`Дедлайн: ${new Date(
                                    assignment.dueDate.seconds * 1000
                                ).toLocaleDateString('uk-UA')}`}
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ mt: 1.5 }}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Секція надсилання роботи */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Моя відповідь</Typography>
                        <Divider sx={{ mb: 2 }} />

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        {submission ? (
                            <Stack spacing={1.5}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <CheckCircleIcon color="success" />
                                    <Typography fontWeight={600} color="success.main">Роботу здано</Typography>
                                </Stack>
                                <Link href={submission.fileURL} target="_blank" rel="noopener" variant="body2">
                                    📎 Переглянути надісланий файл
                                </Link>
                                <Typography variant="caption" color="text.secondary">
                                    Здано:{' '}
                                    {submission.submittedAt
                                        ? new Date(submission.submittedAt.seconds * 1000).toLocaleString('uk-UA')
                                        : '—'}
                                </Typography>

                                {/* Оцінка та коментар (якщо вже є) */}
                                {submission.grade != null && (
                                    <Box
                                        sx={{
                                            mt: 2, p: 2, borderRadius: 2,
                                            bgcolor: 'success.light', color: 'success.contrastText',
                                        }}
                                    >
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            Оцінка: {submission.grade} / 100
                                        </Typography>
                                        {submission.comment && (
                                            <Typography variant="body2" mt={0.5}>
                                                💬 {submission.comment}
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                {/* Можливість перездати */}
                                <Divider />
                                <Typography variant="caption" color="text.secondary">
                                    Ви можете замінити файл, надіславши нову роботу:
                                </Typography>
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Ви ще не здали роботу. Завантажте файл нижче.
                            </Typography>
                        )}

                        {/* Завантаження файлу */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mt={2}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                            >
                                {selectedFile ? selectedFile.name : 'Обрати файл'}
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                />
                            </Button>

                            {selectedFile && (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={uploading}
                                    sx={{ minWidth: 160 }}
                                >
                                    {uploading ? <CircularProgress size={20} /> : 'Надіслати роботу'}
                                </Button>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Приватні коментарі з викладачем */}
                {submission && (
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <SubmissionComments
                                submissionId={submission.id}
                                assignmentId={id}
                                otherUserId={assignment?.createdBy}
                                otherUserName="Викладач"
                            />
                        </CardContent>
                    </Card>
                )}
            </Container>
        </Box>
    );
}
