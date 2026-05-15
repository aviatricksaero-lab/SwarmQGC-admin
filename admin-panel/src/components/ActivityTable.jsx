import React, { useState, useEffect, useMemo } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, Typography, Chip,
    Box, IconButton, Tooltip, TextField, InputAdornment,
    Avatar, Skeleton, alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    History as HistoryIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const cellSx = {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: 'text.primary',
    py: 1.5,
};

const headCellSx = {
    ...cellSx,
    color: 'text.secondary',
    fontWeight: 700,
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    background: 'rgba(255,255,255,0.03)',
};

const ActivityTable = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => { fetchActivities(); }, []);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/parameter-activity`);
            setActivities(res.data);
        } catch (err) {
            console.error('Failed to fetch activity:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() =>
        activities.filter(a =>
            !search || [a.username, a.email, a.activity].some(
                v => v && v.toLowerCase().includes(search.toLowerCase())
            )
        ), [activities, search]);

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const getAvatarColor = (str = '') => {
        const colors = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
        return colors[str.charCodeAt(0) % colors.length];
    };

    return (
        <Box>
            <Paper sx={{ background: 'rgba(22,22,39,0.8)', p: 0, overflow: 'hidden' }}>
                {/* Header */}
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: 2, bgcolor: alpha('#7C3AED', 0.1),
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED'
                        }}>
                            <SecurityIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                                Swarm Mission History
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Tracking multi-drone flight logs and operational events
                            </Typography>
                        </Box>
                    </Box>

                    <TextField
                        size="small"
                        placeholder="Search activity..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment>,
                        }}
                        sx={{
                            width: 240,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.04)',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                            },
                        }}
                    />

                    <Tooltip title="Refresh">
                        <IconButton onClick={fetchActivities} size="small" sx={{ bgcolor: 'rgba(124,58,237,0.1)', color: '#7C3AED', '&:hover': { bgcolor: 'rgba(124,58,237,0.2)' }, borderRadius: 2 }}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {['User', 'Status', 'Timestamp'].map(h => (
                                    <TableCell key={h} sx={headCellSx}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(3)].map((_, j) => (
                                            <TableCell key={j} sx={cellSx}><Skeleton sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : paginated.map((act) => (
                                    <TableRow key={act._id} hover sx={{ transition: 'background 0.1s' }}>
                                        <TableCell sx={cellSx}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{
                                                    width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700,
                                                    bgcolor: getAvatarColor(act.username), borderRadius: '8px'
                                                }}>
                                                    {act.username[0].toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{act.username}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{act.email}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={cellSx}>
                                            <Chip
                                                label={act.activity}
                                                size="small"
                                                icon={<HistoryIcon sx={{ fontSize: '12px !important', color: 'inherit !important' }} />}
                                                sx={{
                                                    bgcolor: alpha('#10B981', 0.1), color: '#10B981',
                                                    border: `1px solid ${alpha('#10B981', 0.2)}`,
                                                    fontWeight: 700, fontSize: '0.68rem',
                                                    '& .MuiChip-icon': { mr: '4px !important' }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={cellSx}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                                {new Date(act.timestamp).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filtered.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
                    sx={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'text.secondary' }}
                />
            </Paper>
        </Box>
    );
};

export default ActivityTable;
