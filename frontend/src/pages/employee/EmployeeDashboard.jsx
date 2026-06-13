import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  CalendarCheck,
  Calendar,
  Wallet,
  Activity,
  MapPin,
  Fingerprint
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

const data = [];

const StatCard = ({ title, value, icon, subValue, color }) => (
  <motion.div 
    whileHover={{ y: -3 }}
    className="card flex items-center gap-4"
  >
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 shrink-0 shadow-sm`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest truncate">{title}</p>
      <h3 className="text-xl font-black text-slate-800 leading-none">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{subValue}</p>
    </div>
  </motion.div>
);

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    attendance: '0%',
    hours: '0h',
    performance: '0.0',
    salary: '₹0'
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetchPersonalData(u.id || u.userId);
    }
  }, []);

  const fetchPersonalData = async (userId) => {
    try {
      setLoading(true);
      const [attRes, payRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/payroll')
      ]);
      
      const myAttendance = attRes.data; // Backend already filters for role='employee'
      const myPayroll = payRes.data[0]; // Get the latest record for this user
      
      // Calculate Stats
      const totalHours = myAttendance.reduce((acc, curr) => acc + (parseFloat(curr.total_hours) || 0), 0);
      const presentDays = myAttendance.filter(a => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'late').length;
      
      setStats({
        attendance: `${presentDays} Days`,
        hours: `${totalHours.toFixed(1)}h`,
        performance: myPayroll?.score || '95%',
        salary: myPayroll?.net_salary ? `₹${parseFloat(myPayroll.net_salary).toLocaleString()}` : '₹0'
      });

      // Prepare Chart Data (Last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const log = myAttendance.find(a => a.date.startsWith(dateStr));
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          hours: log ? parseFloat(log.total_hours || 0) : 0
        };
      });
      setChartData(last7Days);

      // Recent Logs
      setRecentLogs(myAttendance.slice(0, 3));

    } catch (err) {
      console.error('Error fetching employee stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">My Dashboard</h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">Welcome back, {user?.name || 'Employee'}</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Device Online</span>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Days Present" value={loading ? '...' : stats.attendance} icon={<CalendarCheck />} subValue="Current Cycle" color="bg-indigo-500" />
        <StatCard title="Total Hours" value={loading ? '...' : stats.hours} icon={<Clock />} subValue="Logged Work" color="bg-emerald-500" />
        <StatCard title="Performance" value={loading ? '...' : stats.performance} icon={<TrendingUp />} subValue="Rating Score" color="bg-blue-500" />
        <StatCard title="Last Payout" value={loading ? '...' : stats.salary} icon={<Wallet />} subValue="Net Salary" color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Working Hours Chart */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">My Working Hours</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Weekly activity breakdown</p>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">Last 7 Days</div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                  cursor={{ stroke: '#4F46E5', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="hours" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Status Card */}
        <div className="card bg-slate-900 text-white border-none shadow-xl shadow-slate-900/10 flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[12px] font-black uppercase tracking-widest">Recent Activity</h3>
              <span className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div> Updated
              </span>
           </div>

            <div className="space-y-4 flex-1">
               {recentLogs.length > 0 ? recentLogs.map((log, i) => (
                 <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-tight">{new Date(log.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{log.status}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[11px] font-black text-emerald-400">+{log.total_hours}h</p>
                    </div>
                 </div>
               )) : (
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center py-10">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No recent activity detected</p>
                 </div>
               )}
            </div>

           <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5">
              View All Logs
           </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
