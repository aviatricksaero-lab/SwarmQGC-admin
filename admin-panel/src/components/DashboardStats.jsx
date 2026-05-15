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
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ drones: 0, active: 0, battery: 0, alerts: 0 });

    useEffect(() => {
        // Simulated fetch
        setTimeout(() => {
            setStats({ drones: 12, active: 8, battery: 78, alerts: 2 });
            setLoading(false);
        }, 1000);
    }, []);

    const chartData = [
        { time: '12:00', altitude: 45, speed: 12 },
        { time: '12:05', altitude: 52, speed: 15 },
        { time: '12:10', altitude: 48, speed: 14 },
        { time: '12:15', altitude: 60, speed: 18 },
        { time: '12:20', altitude: 55, speed: 16 },
        { time: '12:25', altitude: 58, speed: 17 },
    ];

    return (
        <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <TelemetryCard title="Total Fleet" value={stats.drones} unit="Units" icon={<RadarIcon />} color="#8B5CF6" status="Operational" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <TelemetryCard title="Active Swarm" value={stats.active} unit="Vehicles" icon={<WifiIcon />} color="#10B981" status="In Flight" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <TelemetryCard title="Avg Battery" value={stats.battery} unit="%" icon={<BatteryIcon />} color="#3B82F6" status="Stable" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <TelemetryCard title="Active Alerts" value={stats.alerts} unit="Warnings" icon={<WarningIcon />} color="#EF4444" status="Action Required" />
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                    <SwarmControl />
                    
                    <Paper sx={{ p: 3, mt: 3, background: 'rgba(22,22,39,0.6)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mb: 3 }}>Swarm Telemetry Trends</Typography>
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
                                <Area type="monotone" dataKey="altitude" name="Avg Altitude (m)" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorAlt)" />
                                <Area type="monotone" dataKey="speed" name="Avg Speed (m/s)" stroke="#10B981" fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, height: '100%', background: 'rgba(22,22,39,0.6)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', overflow: 'auto', maxHeight: 600 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white' }}>Drone Fleet</Typography>
                            <Button size="small" sx={{ color: 'primary.main' }}>View All</Button>
                        </Box>
                        
                        <DroneFleetItem id="001" status="Active" battery={85} signal={-45} gps={18} />
                        <DroneFleetItem id="002" status="Active" battery={42} signal={-52} gps={16} />
                        <DroneFleetItem id="003" status="Active" battery={15} signal={-60} gps={12} />
                        <DroneFleetItem id="004" status="Standby" battery={98} signal={-38} gps={0} />
                        <DroneFleetItem id="005" status="Standby" battery={100} signal={-40} gps={0} />
                        <DroneFleetItem id="006" status="Active" battery={67} signal={-48} gps={20} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SwarmDashboard;
