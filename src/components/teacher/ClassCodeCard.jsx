// src/components/teacher/ClassCodeCard.jsx
// Картка з кодом запрошення класу для вчителя (покращена версія)

import React, { useEffect, useState, useCallback } from 'react';
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
    Divider, IconButton, Skeleton, Snackbar, Stack, TextField,
    Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ShareIcon from '@mui/icons-material/Share';
import { useAuth } from '../../context/AuthContext';
import {
    createOrGetClass,
    subscribeClassForTeacher,
    regenerateClassCode,
    removeStudentFromClass,
    createNotification,
    getUsersByIds,
} from '../../firebase/firestoreHelpers';
import { db } from '../../firebase/firebase';
import { doc as fsDoc, updateDoc as fsUpdateDoc } from 'firebase/firestore';

const MOON = '#7EACB5';
const MOON_D = '#5F8F99';
const GUN = '#1B242A';
const BANNER = '#C4D9E3';

export default function ClassCodeCard() {
    const { user } = useAuth();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]); // array of user profiles
    const [membersLoading, setMembersLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [regen, setRegen] = useState(false);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
    const [renameOpen, setRenameOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);

    // Init class and subscribe
    useEffect(() => {
        if (!user) return;
        let unsub;
        createOrGetClass(user.uid, user.displayName || user.email).then(() => {
            unsub = subscribeClassForTeacher(user.uid, (data) => {
                setClassData(data);
                setLoading(false);
            });
        }).catch(() => setLoading(false));
        return () => unsub?.();
    }, [user]);

    // Load real member names when studentIds change
    useEffect(() => {
        if (!classData?.studentIds?.length) {
            setMembers([]);
            return;
        }
        setMembersLoading(true);
        getUsersByIds(classData.studentIds)
            .then(setMembers)
            .finally(() => setMembersLoading(false));
    }, [classData?.studentIds?.join(',')]);

    const handleCopy = useCallback(() => {
        if (!classData?.code) return;
        navigator.clipboard.writeText(classData.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    }, [classData]);

    const handleShare = useCallback(() => {
        const text = `Код для приєднання до класу «${classData?.name}»: ${classData?.code}`;
        if (navigator.share) {
            navigator.share({ title: classData?.name, text });
        } else {
            navigator.clipboard.writeText(text);
            setSnack({ open: true, msg: 'Текст скопійовано в буфер!', severity: 'success' });
        }
    }, [classData]);

    const handleRegen = async () => {
        if (!classData?.id) return;
        setRegen(true);
        try {
            await regenerateClassCode(classData.id);
            setSnack({ open: true, msg: '✓ Новий код згенеровано', severity: 'success' });
        } catch {
            setSnack({ open: true, msg: 'Помилка оновлення коду', severity: 'error' });
        } finally {
            setRegen(false);
        }
    };

    const handleKick = async (studentId, name) => {
        if (!classData?.id) return;
        try {
            await removeStudentFromClass(classData.id, studentId);
            await createNotification(studentId, 'system', classData.id, `Вас відрахували з класу «${classData.name}»`);
            setSnack({ open: true, msg: `${name} відрахований зі списку`, severity: 'info' });
        } catch {
            setSnack({ open: true, msg: 'Помилка', severity: 'error' });
        }
    };

    const handleRename = async () => {
        if (!newName.trim() || !classData?.id) return;
        setSaving(true);
        try {
            await fsUpdateDoc(fsDoc(db, 'classes', classData.id), { name: newName.trim() });
            setRenameOpen(false);
        } catch {
            setSnack({ open: true, msg: 'Помилка збереження', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const codeChars = classData?.code ? classData.code.split('') : [];

    if (loading) {
        return (
            <Card sx={{ borderRadius: 4, background: `linear-gradient(135deg, ${GUN} 0%, #263340 100%)`, p: 3 }}>
                <Skeleton variant="text" width="60%" sx={{ bgcolor: `${MOON}22`, mb: 2 }} />
                <Stack direction="row" spacing={0.8} justifyContent="center">
                    {Array(6).fill(0).map((_, i) => (
                        <Skeleton key={i} variant="rounded" width={44} height={52} sx={{ bgcolor: `${MOON}18` }} />
                    ))}
                </Stack>
            </Card>
        );
    }

    return (
        <>
            <Card
                sx={{
                    borderRadius: 4,
                    background: `linear-gradient(145deg, ${GUN} 0%, #1e2e38 60%, #263340 100%)`,
                    color: '#fff',
                    overflow: 'visible',
                    position: 'relative',
                    boxShadow: '0 12px 40px rgba(27,36,42,0.25)',
                    border: `1px solid ${MOON}18`,
                }}
            >
                {/* Glow accent top-right */}
                <Box sx={{
                    position: 'absolute', top: -30, right: -30,
                    width: 140, height: 140, borderRadius: '50%',
                    background: `radial-gradient(circle, ${MOON}28 0%, transparent 70%)`,
                    pointerEvents: 'none',
                }} />

                <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{
                                width: 44, height: 44, borderRadius: 2.5,
                                background: `linear-gradient(135deg, ${MOON}30, ${MOON}10)`,
                                border: `1.5px solid ${MOON}33`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <SchoolIcon sx={{ color: MOON, fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Stack direction="row" spacing={0.8} alignItems="center">
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                                        {classData?.name || 'Мій клас'}
                                    </Typography>
                                    <Tooltip title="Перейменувати клас">
                                        <IconButton
                                            size="small"
                                            onClick={() => { setNewName(classData?.name || ''); setRenameOpen(true); }}
                                            sx={{ color: `${BANNER}99`, p: 0.3, '&:hover': { color: MOON } }}
                                        >
                                            <EditIcon sx={{ fontSize: 13 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                                <Typography variant="caption" sx={{ color: `${BANNER}99` }}>
                                    Код для запрошення студентів
                                </Typography>
                            </Box>
                        </Stack>
                        <Chip
                            icon={<GroupIcon sx={{ fontSize: 13 }} />}
                            label={`${classData?.studentIds?.length ?? 0}`}
                            size="small"
                            sx={{
                                bgcolor: `${MOON}15`, color: MOON, fontWeight: 700,
                                border: `1px solid ${MOON}33`, fontSize: 12,
                            }}
                        />
                    </Stack>

                    {/* Code boxes */}
                    <Stack direction="row" spacing={0.7} justifyContent="center" mb={0.5}>
                        {codeChars.length > 0 ? codeChars.map((ch, i) => (
                            <React.Fragment key={i}>
                                {/* Visual separator after 3rd character */}
                                {i === 3 && (
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center',
                                        color: `${MOON}55`, fontSize: 18, fontWeight: 300, px: 0.2,
                                    }}>−</Box>
                                )}
                                <Box sx={{
                                    width: 42, height: 50,
                                    borderRadius: 2,
                                    bgcolor: `${MOON}15`,
                                    border: `1.5px solid ${MOON}33`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                    fontSize: 20, fontWeight: 800, color: '#fff',
                                    transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                                    '&:hover': {
                                        bgcolor: `${MOON}28`,
                                        borderColor: `${MOON}77`,
                                        transform: 'translateY(-3px) scale(1.08)',
                                        boxShadow: `0 6px 16px ${MOON}22`,
                                    },
                                }}>
                                    {ch}
                                </Box>
                            </React.Fragment>
                        )) : (
                            <Typography variant="body2" sx={{ color: BANNER }}>Генерується…</Typography>
                        )}
                    </Stack>
                    <Typography variant="caption" sx={{ color: `${BANNER}77`, display: 'block', textAlign: 'center', mb: 2.5, fontSize: 11 }}>
                        Наведіть курсор на символ, щоб виділити
                    </Typography>

                    {/* Action buttons */}
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={copied ? <CheckIcon sx={{ fontSize: '1rem !important' }} /> : <ContentCopyIcon sx={{ fontSize: '1rem !important' }} />}
                            onClick={handleCopy}
                            sx={{
                                bgcolor: copied ? '#48BB78' : MOON,
                                color: '#fff', fontWeight: 700, px: 2.5, borderRadius: 2.5,
                                fontSize: 13, letterSpacing: 0.3,
                                boxShadow: `0 4px 14px ${copied ? '#48BB7840' : `${MOON}40`}`,
                                '&:hover': { bgcolor: copied ? '#38A169' : MOON_D },
                                transition: 'all 0.25s ease',
                            }}
                        >
                            {copied ? 'Скопійовано!' : 'Копіювати'}
                        </Button>

                        <Tooltip title="Поділитись кодом">
                            <IconButton
                                size="small" onClick={handleShare}
                                sx={{
                                    bgcolor: `${MOON}15`, color: MOON,
                                    border: `1.5px solid ${MOON}33`, borderRadius: 2,
                                    '&:hover': { bgcolor: `${MOON}28`, borderColor: `${MOON}66` },
                                }}
                            >
                                <ShareIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Згенерувати новий код">
                            <IconButton
                                size="small" onClick={handleRegen} disabled={regen}
                                sx={{
                                    bgcolor: `${MOON}15`, color: MOON,
                                    border: `1.5px solid ${MOON}33`, borderRadius: 2,
                                    '&:hover': { bgcolor: `${MOON}28`, borderColor: `${MOON}66` },
                                    animation: regen ? 'spin 1s linear infinite' : 'none',
                                    '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                                }}
                            >
                                {regen ? <CircularProgress size={16} sx={{ color: MOON }} /> : <RefreshIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    <Typography variant="caption" sx={{
                        color: `${BANNER}77`, display: 'block', textAlign: 'center', mt: 1.5, fontSize: 11,
                    }}>
                        Поділіться кодом зі студентами · Список оновлюється в реальному часі
                    </Typography>

                    {/* Member list */}
                    {(classData?.studentIds?.length > 0 || membersLoading) && (
                        <>
                            <Divider sx={{ borderColor: `${MOON}18`, my: 2.5 }} />
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="caption" sx={{
                                    color: MOON, fontWeight: 700, letterSpacing: 1.2,
                                    textTransform: 'uppercase', fontSize: 10,
                                }}>
                                    Учасники · {classData?.studentIds?.length ?? 0}
                                </Typography>
                            </Stack>

                            <Stack spacing={0.6}>
                                {membersLoading
                                    ? Array(classData?.studentIds?.length || 2).fill(0).map((_, i) => (
                                        <Skeleton key={i} variant="rounded" height={38} sx={{ bgcolor: `${MOON}10`, borderRadius: 2 }} />
                                    ))
                                    : members.map((m) => (
                                        <Stack
                                            key={m.uid}
                                            direction="row" alignItems="center" justifyContent="space-between"
                                            sx={{
                                                px: 1.5, py: 0.8, borderRadius: 2,
                                                bgcolor: `${MOON}0D`,
                                                border: `1px solid ${MOON}15`,
                                                transition: 'all 0.2s',
                                                '&:hover': { bgcolor: `${MOON}18`, borderColor: `${MOON}33` },
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
                                                    {m.displayName || '—'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: `${BANNER}88`, fontSize: 11 }}>
                                                    {m.email}
                                                </Typography>
                                            </Box>
                                            <Tooltip title="Відрахувати зі списку">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleKick(m.uid, m.displayName || m.email)}
                                                    sx={{
                                                        color: '#FC8181', p: 0.5,
                                                        '&:hover': { bgcolor: '#E53E3E22', color: '#E53E3E' },
                                                    }}
                                                >
                                                    <PersonRemoveIcon sx={{ fontSize: 15 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    ))
                                }
                            </Stack>
                        </>
                    )}

                    {/* Empty state */}
                    {!membersLoading && (!classData?.studentIds?.length) && (
                        <Box sx={{
                            mt: 2.5, pt: 2, borderTop: `1px solid ${MOON}18`,
                            textAlign: 'center',
                        }}>
                            <Typography sx={{ fontSize: 28, mb: 0.5 }}>🎓</Typography>
                            <Typography variant="caption" sx={{ color: `${BANNER}77` }}>
                                Поки жодного студента. Поділіться кодом!
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Rename dialog */}
            <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Назва класу</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus fullWidth label="Назва класу"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        sx={{ mt: 1 }}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        inputProps={{ maxLength: 60 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameOpen(false)} disabled={saving}>Скасувати</Button>
                    <Button
                        variant="contained" onClick={handleRename}
                        disabled={!newName.trim() || saving}
                        startIcon={saving ? <CircularProgress size={14} /> : null}
                    >
                        Зберегти
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open} autoHideDuration={3000}
                onClose={() => setSnack((p) => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack((p) => ({ ...p, open: false }))}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </>
    );
}
