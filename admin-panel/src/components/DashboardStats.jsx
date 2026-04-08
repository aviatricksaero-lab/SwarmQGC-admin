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
    CircularProgress
} from '@mui/material';
import {
    PeopleAlt as UsersIcon,
    FlightTakeoff as FlightsIcon,
    Comment as FeedbackIcon,
    Map as MapIcon,
    TrendingUp as TrendingUpIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const StatCard = ({ title, value, icon, color, subtitle, loading }) => (
    <Card sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.02)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(color, 0.15)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 15px 35px -10px ${alpha(color, 0.3)}`,
            border: `1px solid ${alpha(color, 0.3)}`,
            '& .card-icon-container': {
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: `0 8px 25px ${alpha(color, 0.5)}`,
            }
        }
    }}>
        {/* Decorative elements */}
        <Box sx={{
            position: 'absolute',
            top: -20, right: -20,
            width: 120, height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(color, 0.15)}, transparent 70%)`,
            pointerEvents: 'none',
        }} />
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.65rem' }}>
                        {title}
                    </Typography>
                    {loading ? (
                        <Skeleton variant="text" width={80} height={50} sx={{ bgcolor: alpha(color, 0.1) }} />
                    ) : (
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.1, my: 0.5 }}>
                            {value}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography variant="caption" sx={{ color: alpha('#94A3B8', 0.8), fontWeight: 500, display: 'block' }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box className="card-icon-container" sx={{
                    width: 56, height: 56,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.6)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 6px 20px ${alpha(color, 0.3)}`,
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                }}>
                    {React.cloneElement(icon, { sx: { color: 'white', fontSize: 28 } })}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const ZONE_COLORS = { red: '#EF4444', yellow: '#F59E0B', green: '#10B981', blue: '#3B82F6' };
const PIE_COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper sx={{ p: 1.5, border: '1px solid rgba(255,255,255,0.1)', background: '#1e1e35' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>{label}</Typography>
                {payload.map(p => (
                    <Typography key={p.dataKey} variant="caption" sx={{ color: p.color, display: 'block', fontWeight: 600 }}>
                        {p.name}: {p.value}
                    </Typography>
                ))}
            </Paper>
        );
    }
    return null;
};

const DashboardStats = () => {
    const [stats, setStats] = useState({ userCount: 0, sessionCount: 0, feedbackCount: 0, facilityCount: 0 });
    const [chartData, setChartData] = useState([]);
    const [zoneData, setZoneData] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentSessions, setRecentSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [usersRes, sessionsRes, feedbackRes, facilitiesRes] = await Promise.all([
                axios.get(`${API_URL}/users`),
                axios.get(`${API_URL}/sessions`),
                axios.get(`${API_URL}/feedback`),
                axios.get(`${API_URL}/facilities?all=true`),
            ]);

            const users = usersRes.data;
            const sessions = sessionsRes.data;
            const feedback = feedbackRes.data;
            const facilities = facilitiesRes.data?.features || [];

            // Calculate Flight Stats
            let totalMinutes = 0;
            let completedFlights = 0;
            sessions.forEach(s => {
                if (s.session_type === 'Flight') {
                    totalMinutes += (s.duration || 0);
                    if (s.end_time) completedFlights++;
                }
            });

            // Monthly registrations (last 6 months)
            const monthMap = {};
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const key = d.toLocaleString('default', { month: 'short' });
                monthMap[key] = { month: key, users: 0, sessions: 0 };
            }
            users.forEach(u => {
                const m = new Date(u.created_at).toLocaleString('default', { month: 'short' });
                if (monthMap[m]) monthMap[m].users++;
            });
            sessions.forEach(s => {
                const m = new Date(s.created_at || Date.now()).toLocaleString('default', { month: 'short' });
                if (monthMap[m]) monthMap[m].sessions++;
            });
            setChartData(Object.values(monthMap));

            // Zone type distribution
            const zoneCount = {};
            facilities.forEach(f => {
                const z = f.properties?.zoneType || 'unknown';
                zoneCount[z] = (zoneCount[z] || 0) + 1;
            });
            setZoneData(Object.entries(zoneCount).map(([name, value]) => ({ name, value })));

            setStats({
                userCount: users.length,
                sessionCount: sessions.length,
                feedbackCount: feedback.length,
                facilityCount: facilities.length,
                totalFlightHours: (totalMinutes / 60).toFixed(1),
                missionsCompleted: completedFlights
            });
            setRecentUsers(users.slice(0, 5));
            setRecentSessions(sessions.slice(0, 5));

        } catch (err) {
            setError('Failed to load dashboard data. Check your API connection.');
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

            {/* Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { title: 'Total Users', value: stats.userCount, icon: <UsersIcon />, color: '#7C3AED', subtitle: 'Registered pilots' },
                    { title: 'Hours Flown', value: stats.totalFlightHours + 'h', icon: <TimelineIcon />, color: '#06B6D4', subtitle: 'Total logged duration' },
                    { title: 'Missions', value: stats.missionsCompleted, icon: <FlightsIcon />, color: '#10B981', subtitle: 'Completed flights' },
                    { title: 'Feedback', value: stats.feedbackCount, icon: <FeedbackIcon />, color: '#F59E0B', subtitle: 'User submissions' },
                ].map((card) => (
                    <Grid item xs={12} sm={6} lg={3} key={card.title}>
                        <StatCard {...card} loading={loading} />
                    </Grid>
                ))}
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Growth Chart */}
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, height: 360, background: 'rgba(22,22,39,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ p: 1, borderRadius: '10px', background: alpha('#8B5CF6', 0.15) }}>
                                    <TrendingUpIcon sx={{ color: '#8B5CF6', fontSize: 20, display: 'block' }} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                                        Growth Analytics
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        User & Session trends (last 6 months)
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
                                <CircularProgress size={40} sx={{ color: '#8B5CF6' }} />
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend 
                                        wrapperStyle={{ paddingTop: 20, fontSize: 12, fontWeight: 600 }} 
                                        iconType="circle"
                                        formatter={(v) => <span style={{ color: '#94A3B8' }}>{v}</span>}
                                    />
                                    <Area type="monotone" dataKey="users" name="New Users" stroke="#8B5CF6" strokeWidth={3} fill="url(#gradUsers)" dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 2, stroke: '#0B0B14' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                    <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#10B981" strokeWidth={3} fill="url(#gradSessions)" dot={{ fill: '#10B981', r: 4, strokeWidth: 2, stroke: '#0B0B14' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Grid>

                {/* Zone Distribution Pie */}
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, height: 360, background: 'rgba(22,22,39,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <Box sx={{ p: 1, borderRadius: '10px', background: alpha('#EF4444', 0.15) }}>
                                <MapIcon sx={{ color: '#EF4444', fontSize: 20, display: 'block' }} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                                    Zone Distribution
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Airspace facility types
                                </Typography>
                            </Box>
                        </Box>
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
                                <CircularProgress size={40} sx={{ color: '#EF4444' }} />
                            </Box>
                        ) : zoneData.length === 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No airspace data</Typography>
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={zoneData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={5} dataKey="value" stroke="none">
                                        {zoneData.map((entry, index) => (
                                            <Cell key={index} fill={ZONE_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend 
                                        iconType="circle"
                                        formatter={(v) => <span style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{v}</span>} 
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Recent Activity */}
            <Grid container spacing={3}>
                {/* Recent Users */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, background: 'rgba(22,22,39,0.8)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <UsersIcon sx={{ color: '#7C3AED', fontSize: 18 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>
                                Recent Registrations
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
                        {loading ? (
                            [...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.04)' }} />)
                        ) : recentUsers.length === 0 ? (
                            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>No users yet</Typography>
                        ) : (
                            <Box>
                                {recentUsers.map((user) => (
                                    <Box key={user._id} sx={{
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        p: 1.2, borderRadius: 2, mb: 0.5,
                                        '&:hover': { bgcolor: 'rgba(124,58,237,0.08)' },
                                        transition: 'background 0.2s',
                                    }}>
                                        <Box sx={{
                                            width: 34, height: 34, borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, color: 'white', fontSize: '0.8rem', flexShrink: 0,
                                        }}>
                                            {(user.displayname || user.username || 'U')[0].toUpperCase()}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'white', noWrap: true }}>
                                                {user.displayname || user.username}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                {user.email}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Recent Sessions */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, background: 'rgba(22,22,39,0.8)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <FlightsIcon sx={{ color: '#10B981', fontSize: 18 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>
                                Recent Sessions
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
                        {loading ? (
                            [...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.04)' }} />)
                        ) : recentSessions.length === 0 ? (
                            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>No sessions recorded</Typography>
                        ) : (
                            <Box>
                                {recentSessions.map((s) => (
                                    <Box key={s._id} sx={{
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        p: 1.2, borderRadius: 2, mb: 0.5,
                                        '&:hover': { bgcolor: 'rgba(16,185,129,0.08)' },
                                        transition: 'background 0.2s',
                                    }}>
                                        <Box sx={{
                                            width: 34, height: 34, borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <FlightsIcon sx={{ color: 'white', fontSize: 16 }} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                                                {s.username}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                {s.date} · {s.start_time} → {s.end_time}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                            <Chip
                                                label={s.session_type || 'Connection'}
                                                size="small"
                                                sx={{
                                                    bgcolor: s.session_type === 'Flight' ? alpha('#8B5CF6', 0.12) : alpha('#06B6D4', 0.12),
                                                    color: s.session_type === 'Flight' ? '#8B5CF6' : '#06B6D4',
                                                    border: `1px solid ${s.session_type === 'Flight' ? alpha('#8B5CF6', 0.3) : alpha('#06B6D4', 0.3)}`,
                                                    fontWeight: 700, fontSize: '0.65rem',
                                                    height: 20
                                                }}
                                            />
                                            <Chip
                                                label={`${Math.round(s.duration || 0)}m`}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha('#10B981', 0.15),
                                                    color: '#10B981',
                                                    border: `1px solid ${alpha('#10B981', 0.3)}`,
                                                    fontWeight: 600, fontSize: '0.7rem',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardStats;
