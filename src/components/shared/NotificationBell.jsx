// src/components/shared/NotificationBell.jsx
// Дзвіночок сповіщень у Navbar — бейдж + попover зі списком

import React, { useEffect, useState } from 'react';
import {
    Badge, Box, Divider, IconButton, List, ListItem, ListItemText,
    Popover, Stack, Tooltip, Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import GradeIcon from '@mui/icons-material/Grade';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useAuth } from '../../context/AuthContext';
import { subscribeNotifications, markAllNotificationsRead } from '../../api/endpoints';

const MOON = '#7EACB5';
const MOON_P = 'rgba(126,172,181,0.12)';
const GUN = '#1B242A';
const BANNER = '#2D3748';

const TYPE_META = {
    grade: { icon: <GradeIcon sx={{ fontSize: 16 }} />, color: '#48BB78', label: 'Оцінка' },
    comment: { icon: <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />, color: MOON, label: 'Коментар' },
    assignment: { icon: <AssignmentIcon sx={{ fontSize: 16 }} />, color: '#ED8936', label: 'Завдання' },
    announcement: { icon: <AnnouncementIcon sx={{ fontSize: 16 }} />, color: '#9F7AEA', label: 'Оголошення' },
};

function timeAgo(ts) {
    if (!ts) return '';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    const mins = Math.round((Date.now() - d) / 60000);
    if (mins < 1) return 'щойно';
    if (mins < 60) return `${mins} хв тому`;
    if (mins < 1440) return `${Math.round(mins / 60)} год тому`;
    return d.toLocaleDateString('uk-UA');
}

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifs, setNotifs] = useState([]);
    const [unread, setUnread] = useState(0);
    const [anchor, setAnchor] = useState(null);

    useEffect(() => {
        if (!user?.uid) return;
        const unsub = subscribeNotifications(user._id, (all) => {
            setNotifs(all.slice(0, 12)); // показуємо останні 12
            setUnread(all.filter(n => !n.read).length);
        });
        return unsub;
    }, [user?.uid]);

    function handleOpen(e) {
        setAnchor(e.currentTarget);
    }

    async function handleClose() {
        setAnchor(null);
        if (unread > 0) await markAllNotificationsRead(user._id);
    }

    const open = Boolean(anchor);

    return (
        <>
            <Tooltip title="Сповіщення">
                <IconButton onClick={handleOpen} sx={{ color: 'inherit' }}>
                    <Badge
                        badgeContent={unread}
                        max={9}
                        sx={{
                            '& .MuiBadge-badge': {
                                bgcolor: '#E53E3E',
                                color: 'white',
                                fontSize: 10,
                                fontWeight: 800,
                                minWidth: 18,
                                height: 18,
                            },
                        }}
                    >
                        {unread > 0
                            ? <NotificationsIcon sx={{ fontSize: 22 }} />
                            : <NotificationsNoneIcon sx={{ fontSize: 22 }} />}
                    </Badge>
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchor}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        width: 340, maxHeight: 480, overflow: 'hidden',
                        borderRadius: 2.5,
                        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
                    },
                }}
            >
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center"
                    sx={{ px: 2, py: 1.5, bgcolor: BANNER, color: 'white' }}>
                    <Typography fontWeight={700} fontSize="0.95rem">
                        🔔 Сповіщення {unread > 0 && <Typography component="span" sx={{ color: MOON, fontWeight: 800 }}>({unread})</Typography>}
                    </Typography>
                    {unread > 0 && (
                        <Tooltip title="Позначити всі як прочитані">
                            <IconButton size="small" onClick={() => markAllNotificationsRead(user._id)} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: MOON } }}>
                                <DoneAllIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
                <Divider />

                {/* List */}
                <Box sx={{ overflowY: 'auto', maxHeight: 400 }}>
                    {notifs.length === 0 ? (
                        <Box textAlign="center" py={5}>
                            <NotificationsNoneIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Немає сповіщень
                            </Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {notifs.map((n, i) => {
                                const meta = TYPE_META[n.type] || TYPE_META.comment;
                                return (
                                    <React.Fragment key={n._id}>
                                        <ListItem
                                            alignItems="flex-start"
                                            sx={{
                                                px: 2, py: 1.25,
                                                bgcolor: n.read ? 'transparent' : MOON_P,
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                                            }}
                                        >
                                            <Box sx={{
                                                mr: 1.5, mt: 0.5, width: 30, height: 30,
                                                borderRadius: '50%', flexShrink: 0,
                                                bgcolor: meta.color + '20',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: meta.color,
                                            }}>
                                                {meta.icon}
                                            </Box>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ color: GUN, lineHeight: 1.4, fontWeight: n.read ? 400 : 600 }}>
                                                        {n.message}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" color="text.disabled">
                                                        {timeAgo(n.createdAt)}
                                                    </Typography>
                                                }
                                            />
                                            {!n.read && (
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: MOON, mt: 1, ml: 0.5, flexShrink: 0 }} />
                                            )}
                                        </ListItem>
                                        {i < notifs.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    )}
                </Box>
            </Popover>
        </>
    );
}
