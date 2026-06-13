import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Activity, 
  Wallet, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  Fingerprint,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';

const Sidebar = ({ type = 'admin' }) => {
  const { user, logout } = useAuth();
  const adminLinks = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin' },
    { name: 'Employees', icon: <Users size={18} />, path: '/admin/employees' },
    { name: 'Attendance', icon: <CalendarCheck size={18} />, path: '/admin/attendance' },
    // { name: 'Live Monitor', icon: <Activity size={18} />, path: '/admin/live' },
    { name: 'Payroll', icon: <Wallet size={18} />, path: '/admin/payroll' },
    { name: 'Invoices', icon: <FileText size={18} />, path: '/admin/invoices' },
    { name: 'Reports', icon: <BarChart3 size={18} />, path: '/admin/reports' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/admin/settings' },
    { name: 'Profile', icon: <Users size={18} />, path: '/admin/profile' },
  ];

  const employeeLinks = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/employee' },
    { name: 'My Attendance', icon: <CalendarCheck size={18} />, path: '/employee/attendance' },
    { name: 'My Salary', icon: <Wallet size={18} />, path: '/employee/salary' },
    // { name: 'Reports', icon: <BarChart3 size={18} />, path: '/employee/reports' },
    { name: 'Profile', icon: <Users size={18} />, path: '/employee/profile' },
  ];

  const links = type === 'admin' ? adminLinks : employeeLinks;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="w-[230px] bg-white h-full flex flex-col no-print">
      {/* Brand Section */}
      <div className="p-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 text-primary">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Fingerprint size={20} className="text-white" />
          </div>
          <div>
             <span className="text-lg font-black tracking-tighter text-slate-800 uppercase leading-none block">BioTrack</span>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1 block">Pro System</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-6 custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-1' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-primary hover:translate-x-1'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}>
                    {link.icon}
                  </span>
                  <span className="font-black text-[11px] uppercase tracking-widest leading-none truncate">
                    {link.name}
                  </span>
                </div>
                {isActive && (
                  <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                    <ChevronRight size={14} className="text-white/70" />
                  </motion.div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile Preview */}
      <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-100 shadow-sm mb-4">
           <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
              {user?.photo ? (
                <img src={user.photo} alt="user" className="w-full h-full object-cover" />
              ) : (
                <Users size={16} className="text-slate-300" />
              )}
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-800 truncate uppercase">
                {user?.name || 'Kiaan Admin'}
              </p>
              <p className="text-[8px] font-bold text-emerald-500 uppercase">Active Now</p>
           </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all duration-200 font-black text-[11px] uppercase tracking-widest"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
