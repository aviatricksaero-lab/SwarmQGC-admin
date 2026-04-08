import React, { useState, useEffect, useMemo } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, Typography,
    Box, IconButton, Tooltip, TextField, InputAdornment,
    Alert, Skeleton, alpha, Chip, Dialog, DialogTitle,
    DialogContent, IconButton as MuiIconButton, Button, Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Map as MapIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Flight as FlightIcon,
    CalendarToday as DateIcon,
    Person as UserIcon
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const cellSx = { borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'text.primary', py: 1.5 };
const headCellSx = { ...cellSx, color: 'text.secondary', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.03)' };

const MissionsTable = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [viewMapOpen, setViewMapOpen] = useState(false);
    const [selectedMission, setSelectedMission] = useState(null);

    useEffect(() => { fetchMissions(); }, []);

    const fetchMissions = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_URL}/missions`);
            setMissions(res.data);
        } catch (err) {
            setError('Failed to fetch missions.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this mission log?')) return;
        try {
            await axios.delete(`${API_URL}/missions/${id}`);
            setMissions(prev => prev.filter(m => m._id !== id));
            toast.success('Mission deleted');
        } catch (err) {
            toast.error('Failed to delete mission');
        }
    };

    const filtered = useMemo(() =>
        missions.filter(m =>
            !search || [m.username, m.mission_name].some(v => v && v.toLowerCase().includes(search.toLowerCase()))
        ), [missions, search]);

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const openMap = (mission) => {
        setSelectedMission(mission);
        setViewMapOpen(true);
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>
            )}

            <Paper sx={{ background: 'rgba(22,22,39,0.8)', overflow: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>Mission Logs</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {filtered.length} missions · Geometric flight data
                        </Typography>
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Search mission or user..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment>,
                        }}
                        sx={{
                            width: 260,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                            },
                        }}
                    />
                    <Tooltip title="Refresh">
                        <IconButton onClick={fetchMissions} size="small" sx={{ bgcolor: 'rgba(139,92,246,0.1)', color: '#8B5CF6', '&:hover': { bgcolor: 'rgba(139,92,246,0.2)' }, borderRadius: 2 }}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <TableContainer>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {['Mission Name', 'Pilot', 'Date', 'Waypoints', 'Actions'].map(h => (
                                    <TableCell key={h} sx={headCellSx}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(5)].map((_, j) => (
                                            <TableCell key={j} sx={cellSx}><Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : paginated.map((m) => (
                                    <TableRow key={m._id} hover>
                                        <TableCell sx={cellSx}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{
                                                    width: 32, height: 32, borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <FlightIcon sx={{ color: 'white', fontSize: 16 }} />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{m.mission_name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={cellSx}>{m.username}</TableCell>
                                        <TableCell sx={cellSx}>{m.date || new Date(m.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell sx={cellSx}>
                                            <Chip 
                                                label={`${m.geometry?.coordinates?.length || 0} Points`}
                                                size="small"
                                                sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={cellSx}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Visualize Mission">
                                                    <IconButton 
                                                        onClick={() => openMap(m)}
                                                        size="small" 
                                                        sx={{ color: '#8B5CF6', '&:hover': { bgcolor: alpha('#8B5CF6', 0.1) } }}
                                                    >
                                                        <MapIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton 
                                                        onClick={() => handleDelete(m._id)}
                                                        size="small" 
                                                        sx={{ color: '#EF4444', '&:hover': { bgcolor: alpha('#EF4444', 0.1) } }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filtered.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
                    sx={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'text.secondary' }}
                />
            </Paper>

            {/* Map Visualization Dialog */}
            <Dialog 
                open={viewMapOpen} 
                onClose={() => setViewMapOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { background: '#121221', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <MapIcon sx={{ color: '#8B5CF6' }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                            {selectedMission?.mission_name}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setViewMapOpen(false)} sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                <DialogContent sx={{ p: 0, height: 500, bgcolor: '#0b0b14', position: 'relative', overflow: 'hidden' }}>
                    {/* Placeholder for Map Visualization */}
                    <Box sx={{ 
                        width: '100%', height: '100%', 
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'text.secondary', p: 4
                    }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Geometry: {selectedMission?.geometry?.type} with {selectedMission?.geometry?.coordinates?.length || 0} waypoints
                        </Typography>
                        
                        {/* Improved SVG Path Preview */}
                        {selectedMission?.geometry?.coordinates?.length > 0 ? (
                            <Box sx={{ 
                                width: '100%', height: '100%', 
                                position: 'relative',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                p: 2
                            }}>
                                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                                    {(() => {
                                        const coords = selectedMission.geometry.coordinates;
                                        if (!coords || coords.length === 0) return null;

                                        // Find min/max for normalization
                                        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                                        coords.forEach(c => {
                                            const x = c[0]; // lon
                                            const y = c[1]; // lat
                                            if (x < minX) minX = x; if (x > maxX) maxX = x;
                                            if (y < minY) minY = y; if (y > maxY) maxY = y;
                                        });

                                        const rangeX = maxX - minX || 0.0001;
                                        const rangeY = maxY - minY || 0.0001;

                                        // Map coordinates to 5-95 range to give some padding
                                        const points = coords.map(c => {
                                            const px = 5 + ((c[0] - minX) / rangeX) * 90;
                                            const py = 95 - ((c[1] - minY) / rangeY) * 90; // Invert Y for screen coords
                                            return `${px},${py}`;
                                        }).join(' ');

                                        return (
                                            <>
                                                <polyline 
                                                    points={points}
                                                    fill="none"
                                                    stroke="#8B5CF6"
                                                    strokeWidth="1.5"
                                                    strokeLinejoin="round"
                                                    strokeLinecap="round"
                                                />
                                                {/* Start Point */}
                                                <circle cx={5 + ((coords[0][0] - minX) / rangeX) * 90} cy={95 - ((coords[0][1] - minY) / rangeY) * 90} r="2" fill="#10B981" />
                                                {/* End Point */}
                                                <circle cx={5 + ((coords[coords.length-1][0] - minX) / rangeX) * 90} cy={95 - ((coords[coords.length-1][1] - minY) / rangeY) * 90} r="2" fill="#EF4444" />
                                            </>
                                        );
                                    })()}
                                </svg>
                                <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 1 }}>
                                    <Chip label="Start" size="small" sx={{ bgcolor: alpha('#10B981', 0.2), color: '#10B981', fontSize: '0.6rem', height: 18 }} />
                                    <Chip label="End" size="small" sx={{ bgcolor: alpha('#EF4444', 0.2), color: '#EF4444', fontSize: '0.6rem', height: 18 }} />
                                </Box>
                                <Typography variant="caption" sx={{ position: 'absolute', bottom: 10, bgcolor: 'rgba(0,0,0,0.6)', px: 1.5, py: 0.5, borderRadius: 1, color: 'white' }}>
                                    Scaled Flight Path Geometry
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2">No geometry data available for this mission.</Typography>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default MissionsTable;
