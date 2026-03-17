// src/components/shared/SubmissionComments.jsx
// Приватний чат між вчителем та студентом всередині конкретної здачі

import React, { useEffect, useRef, useState } from 'react';
import {
    Avatar, Box, Divider, IconButton, InputBase, Paper,
    Stack, Tooltip, Typography, CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useAuth } from '../../context/AuthContext';
import {
    addSubmissionComment,
    subscribeSubmissionComments,
    createNotification,
} from '../../firebase/firestoreHelpers';

const MOON = '#7EACB5';
const MOON_P = 'rgba(126,172,181,0.14)';
const GUN = '#1B242A';
const BANNER = '#2D3748';

function timeAgo(ts) {
    if (!ts) return '';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/**
 * @param {{ submissionId: string, assignmentId: string, otherUserId: string, otherUserName: string }} props
 * otherUserId / otherUserName — хто є "іншим" (teacher↔student)
 */
export default function SubmissionComments({ submissionId, assignmentId, otherUserId, otherUserName }) {
    const { user, role } = useAuth();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!submissionId) return;
        const unsub = subscribeSubmissionComments(submissionId, setComments);
        return unsub;
    }, [submissionId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    async function handleSend(e) {
        e.preventDefault();
        if (!text.trim() || sending) return;
        setSending(true);
        try {
            await addSubmissionComment({
                submissionId,
                assignmentId,
                authorId: user.uid,
                authorName: user.displayName || user.email?.split('@')[0] || '?',
                role,
                text: text.trim(),
            });
            // Сповіщаємо іншого учасника
            if (otherUserId) {
                await createNotification(
                    otherUserId,
                    'comment',
                    submissionId,
                    `${user.displayName || 'Користувач'} залишив(ла) коментар до здачі`
                );
            }
            setText('');
        } finally {
            setSending(false);
        }
    }

    const isMe = (c) => c.authorId === user.uid;

    return (
        <Box sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: MOON }} />
                <Typography variant="body2" fontWeight={700} sx={{ color: GUN }}>
                    Приватні коментарі
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    (видно лише вчителю та студенту)
                </Typography>
            </Stack>

            {/* Список коментарів */}
            <Box
                sx={{
                    maxHeight: 260, overflowY: 'auto', px: 1, py: 1,
                    bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.07)',
                    mb: 1.5,
                }}
            >
                {comments.length === 0 ? (
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', py: 3 }}>
                        Коментарів ще немає — напишіть першим!
                    </Typography>
                ) : (
                    comments.map((c) => (
                        <Box
                            key={c.id}
                            sx={{
                                display: 'flex',
                                flexDirection: isMe(c) ? 'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                gap: 1,
                                mb: 1.5,
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 28, height: 28,
                                    bgcolor: c.role === 'teacher' ? BANNER : MOON,
                                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                                }}
                            >
                                {(c.authorName || '?')[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ maxWidth: '72%' }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        px: 1.5, py: 1,
                                        bgcolor: isMe(c) ? MOON_P : 'white',
                                        border: `1px solid ${isMe(c) ? MOON + '50' : 'rgba(0,0,0,0.08)'}`,
                                        borderRadius: isMe(c) ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                    }}
                                >
                                    <Typography variant="caption" fontWeight={700} sx={{ color: c.role === 'teacher' ? BANNER : MOON, display: 'block' }}>
                                        {c.authorName}
                                        {c.role === 'teacher' && ' · Викладач'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: GUN, lineHeight: 1.5 }}>
                                        {c.text}
                                    </Typography>
                                </Paper>
                                <Typography variant="caption" sx={{ color: 'text.disabled', px: 0.5 }}>
                                    {timeAgo(c.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                    ))
                )}
                <div ref={bottomRef} />
            </Box>

            {/* Поле вводу */}
            <Paper
                component="form"
                onSubmit={handleSend}
                elevation={0}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 0.5,
                    border: `1px solid ${MOON}50`,
                    borderRadius: 3,
                    '&:focus-within': { borderColor: MOON, boxShadow: `0 0 0 2px ${MOON}22` },
                }}
            >
                <Avatar sx={{ width: 26, height: 26, bgcolor: role === 'teacher' ? BANNER : MOON, fontSize: 11 }}>
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                </Avatar>
                <InputBase
                    fullWidth
                    placeholder="Написати коментар..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    sx={{ fontSize: '0.875rem' }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                />
                <Tooltip title="Надіслати">
                    <span>
                        <IconButton type="submit" size="small" disabled={!text.trim() || sending} sx={{ color: MOON }}>
                            {sending ? <CircularProgress size={16} /> : <SendIcon fontSize="small" />}
                        </IconButton>
                    </span>
                </Tooltip>
            </Paper>
        </Box>
    );
}
