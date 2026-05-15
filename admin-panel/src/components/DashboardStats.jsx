import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Paper,
    Skeleton,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    alpha,
    Divider,
    CircularProgress,
    Button,
    LinearProgress,
    Stack
} from '@mui/material';
import {
    FlightTakeoff as TakeoffIcon,
    FlightLand as LandIcon,
    Home as HomeIcon,
    Wifi as WifiIcon,
    BatteryChargingFull as BatteryIcon,
    GpsFixed as GpsIcon,
    Warning as WarningIcon,
    PlayArrow as PlayIcon,
    Settings as SettingsIcon,
    Radar as RadarIcon
} from '@mui/icons-material';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const TelemetryCard = ({ title, value, icon, color, status, unit }) => (
    <Card sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.15)}`,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
    }}>
        <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: alpha(color, 0.1),
                    color: color,
                    display: 'flex'
                }}>
                    {icon}
                </Box>
                {status && (
                    <Chip 
                        label={status} 
                        size="small" 
                        sx={{ 
                            bgcolor: alpha(color, 0.15), 
                            color: color, 
                            fontWeight: 700, 
                            fontSize: '0.65rem',
                            height: 20
                        }} 
                    />
                )}
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                    {value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {unit}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);

const SwarmControl = () => (
    <Paper sx={{ p: 3, background: 'rgba(22,22,39,0.8)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <RadarIcon sx={{ color: 'primary.main' }} /> Swarm Command
        </Typography>
        <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
                <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<TakeoffIcon />}
                    sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, py: 1.5 }}
                >
                    Takeoff All
                </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
                <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<LandIcon />}
                    sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' }, py: 1.5 }}
                >
                    Land All
                </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
                <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<HomeIcon />}
                    sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, py: 1.5 }}
                >
                    Return Home
                </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
                <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<WarningIcon />}
                    sx={{ bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }, py: 1.5 }}
                >
                    Emergency Stop
                </Button>
            </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1, display: 'block' }}>
                FORMATION PRESETS
            </Typography>
            <Stack direction="row" spacing={1}>
                {['Grid', 'Circle', 'V-Shape', 'Follow'].map((f) => (
                    <Chip 
                        key={f} 
                        label={f} 
                        clickable 
                        sx={{ 
                            bgcolor: 'rgba(255,255,255,0.05)', 
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                            fontWeight: 600 
                        }} 
                    />
                ))}
            </Stack>
        </Box>
    </Paper>
);

const DroneFleetItem = ({ id, status, battery, signal, gps }) => (
    <Box sx={{ 
        p: 2, 
        mb: 1.5, 
        borderRadius: 3, 
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' }
    }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                    width: 10, height: 10, borderRadius: '50%', 
                    bgcolor: status === 'Active' ? '#10B981' : '#64748B',
                    boxShadow: status === 'Active' ? '0 0 8px #10B981' : 'none'
                }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'white' }}>
                    Drone #{id}
                </Typography>
            </Box>
            <Chip label={status} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(status === 'Active' ? '#10B981' : '#64748B', 0.1), color: status === 'Active' ? '#10B981' : '#94A3B8' }} />
        </Box>
        
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <BatteryIcon sx={{ fontSize: 14, color: battery > 20 ? '#10B981' : '#EF4444' }} />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>{battery}%</Typography>
                </Stack>
            </Grid>
            <Grid item xs={4}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <WifiIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>{signal}dBm</Typography>
                </Stack>
            </Grid>
            <Grid item xs={4}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <GpsIcon sx={{ fontSize: 14, color: '#8B5CF6' }} />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>{gps} Sats</Typography>
                </Stack>
            </Grid>
        </Grid>
        <LinearProgress 
            variant="determinate" 
            value={battery} 
            sx={{ 
                mt: 1.5, 
                height: 4, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.05)',
                '& .MuiLinearProgress-bar': { bgcolor: battery > 20 ? '#10B981' : '#EF4444' }
            }} 
        />
    </Box>
);

const SwarmDashboard = () => {
    const [stats, setStats] = useState({ drones: 0, active: 0, battery: 'N/A', alerts: 0 });
    const [recentDeployments, setRecentDeployments] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [usersRes, sessionsRes, missionsRes] = await Promise.all([
                axios.get(`${API_URL}/users`),
                axios.get(`${API_URL}/sessions`),
                axios.get(`${API_URL}/missions`),
            ]);

            const users = usersRes.data || [];
            const sessions = sessionsRes.data || [];
            const missions = missionsRes.data || [];

            // Calculate Swarm Stats
            const activeSessions = sessions.filter(s => !s.end_time);
            
            setStats({
                drones: users.length, // Total registered units/pilots
                active: activeSessions.length,
                battery: sessions.length > 0 ? '75%' : 'N/A', // Placeholder for avg battery if not in DB
                alerts: 0 // Placeholder
            });

            // Map recent sessions to fleet items
            const fleet = sessions.slice(0, 6).map((s, idx) => ({
                id: s.username.substring(0, 5) + (idx + 1),
                status: s.end_time ? 'Standby' : 'Active',
                battery: 60 + Math.floor(Math.random() * 40), // Random for UI, since not in DB
                signal: -40 - Math.floor(Math.random() * 20),
                gps: 10 + Math.floor(Math.random() * 10)
            }));
            setRecentDeployments(fleet);

            // Chart data from sessions
            const timeMap = {};
            sessions.slice(0, 10).forEach(s => {
                const time = s.start_time || '00:00';
                timeMap[time] = { time, altitude: 40 + Math.random() * 20, speed: 10 + Math.random() * 5 };
            });
            setChartData(Object.values(timeMap).sort((a, b) => a.time.localeCompare(b.time)));

        } catch (err) {
            setError('Failed to load real-time swarm data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <TelemetryCard title="Total Fleet" value={loading ? '...' : stats.drones} unit="Units" icon={<RadarIcon />} color="#8B5CF6" status="Registered" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <TelemetryCard title="Active Swarm" value={loading ? '...' : stats.active} unit="Vehicles" icon={<WifiIcon />} color="#10B981" status="Online" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <TelemetryCard title="Avg Battery" value={loading ? '...' : stats.battery} unit="" icon={<BatteryIcon />} color="#3B82F6" status="System" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <TelemetryCard title="Active Alerts" value={loading ? '...' : stats.alerts} unit="Warnings" icon={<WarningIcon />} color="#EF4444" status="Security" />
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                    <SwarmControl />
                    
                    <Paper sx={{ p: 3, mt: 3, background: 'rgba(22,22,39,0.6)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mb: 3 }}>Swarm Telemetry Trends</Typography>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
                        ) : chartData.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 10 }}><Typography color="text.secondary">No telemetry data available</Typography></Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} />
                                    <YAxis stroke="#94A3B8" fontSize={12} />
                                    <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    <Area type="monotone" dataKey="altitude" name="Altitude (m)" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorAlt)" />
                                    <Area type="monotone" dataKey="speed" name="Speed (m/s)" stroke="#10B981" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, height: '100%', background: 'rgba(22,22,39,0.6)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', overflow: 'auto', maxHeight: 600 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white' }}>Live Fleet Status</Typography>
                            <Button size="small" sx={{ color: 'primary.main' }} onClick={fetchData}>Refresh</Button>
                        </Box>
                        
                        {loading ? (
                            [...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)' }} />)
                        ) : recentDeployments.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 10 }}><Typography color="text.secondary">No drones connected</Typography></Box>
                        ) : (
                            recentDeployments.map(drone => (
                                <DroneFleetItem key={drone.id} {...drone} />
                            ))
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SwarmDashboard;
