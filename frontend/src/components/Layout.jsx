import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, Menu, X, User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';

const Layout = ({ children, type = 'admin' }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block shrink-0 border-r border-slate-200 h-full shadow-sm bg-white z-30 no-print">
        <Sidebar type={type} />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] lg:hidden"
            />
            <motion.div
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[240px] bg-white z-[50] lg:hidden shadow-2xl"
            >
              <div className="flex justify-end p-4 border-b border-slate-50">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <Sidebar type={type} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Refined Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 shrink-0 shadow-sm no-print">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-100"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Device Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl transition-all border ${showNotifications ? 'bg-primary/10 text-primary border-primary/20' : 'text-slate-500 hover:bg-slate-50 border-slate-100'}`}
              >
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowNotifications(false)}
                      className="fixed inset-0 z-10"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Notifications</h3>
                        <span className="text-[10px] font-black text-white bg-primary px-2.5 py-0.5 rounded-full shadow-lg shadow-primary/20">3 NEW</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {[
                          { title: 'New Attendance Punch', desc: 'Arjun Mehra punched in at Noida Site', time: '2 mins ago', type: 'attendance' },
                          { title: 'System Alert', desc: 'Main Entrance machine sync completed', time: '1 hour ago', type: 'system' },
                          { title: 'Payroll Ready', desc: 'Cycle for April 15-30 has been generated', time: '5 hours ago', type: 'payroll' },
                        ].map((n, i) => (
                          <div key={i} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 cursor-pointer group">
                            <p className="text-xs font-black text-slate-800 group-hover:text-primary transition-colors">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.desc}</p>
                            <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">{n.time}</p>
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-3.5 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all bg-slate-50/50 border-t border-slate-100">View All Updates</button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <Link to={`/${type}/profile`} className="flex items-center gap-3 pl-1 group bg-slate-50 hover:bg-primary/5 p-1.5 pr-3 rounded-2xl border border-slate-100 transition-all">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                {user?.photo ? (
                  <img src={user.photo} alt="user" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-slate-300" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[12px] font-black text-slate-800 leading-none group-hover:text-primary transition-colors uppercase tracking-tight">
                  {user?.name || 'Kiaan Admin'}
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {user?.role || 'Master Admin'}
                </p>
              </div>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-primary transition-colors ml-1" />
            </Link>
          </div>
        </header>

        {/* Main Content Area - Medium Density Padding */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-6">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
