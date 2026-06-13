import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import {
  Calendar,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  X,
  MapPin,
  Smartphone,
  Plus,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleDownload } from '../../utils/export';

const Attendance = () => {
  const formatForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    return days;
  };

  const [view, setView] = useState('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState('All Shifts');

  const [dailyLogs, setDailyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [manualData, setManualData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    inTime: '08:00',
    outTime: '17:00',
    status: 'present'
  });
  const [bulkData, setBulkData] = useState({
    employeeIds: [],
    date: new Date().toISOString().split('T')[0],
    inTime: '08:00',
    outTime: '17:00',
    status: 'present'
  });
  const [holidays, setHolidays] = useState([]);
  const [bulkShift, setBulkShift] = useState('All Shifts');
  const [manualShift, setManualShift] = useState('All Shifts');
  const [bulkSearch, setBulkSearch] = useState('');
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
    fetchHolidays();
  }, [currentDate, selectedShift]);

  const fetchHolidays = async () => {
    try {
      const response = await api.get('/attendance/holidays');
      setHolidays(response.data);
    } catch (err) {
      console.error('Error fetching holidays:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance', {
        params: {
          date: currentDate.toISOString().split('T')[0],
          shift: selectedShift
        }
      });
      setDailyLogs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/attendance/manual', manualData);
      setShowManualModal(false);
      fetchAttendance();
    } catch (err) {
      console.error('Error adding manual attendance:', err);
      alert('Failed to add manual attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/attendance/bulk', bulkData);
      setShowBulkModal(false);
      fetchAttendance();
    } catch (err) {
      console.error('Error in bulk attendance:', err);
      alert('Failed to update bulk attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async () => {
    try {
      setLoading(true);
      await api.put(`/attendance/${selectedLog.id}`, selectedLog);
      setIsEditing(false);
      setShowDetailModal(false);
      fetchAttendance();
    } catch (err) {
      console.error('Error updating attendance:', err);
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (dailyLogs.length === 0) return alert('No data to export');
    const headers = ['Name', 'ID', 'Shift', 'Punch In', 'Punch Out', 'Total Hours', 'Status', 'Date'];
    const rows = dailyLogs.map(log => [
      log.name, log.employee_id, log.shift || '---',
      log.in_time ? new Date(log.in_time).toLocaleTimeString() : '---',
      log.out_time ? new Date(log.out_time).toLocaleTimeString() : '---',
      log.total_hours || '0.00', log.status, log.date
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    handleDownload(`Attendance_${currentDate.toISOString().split('T')[0]}.csv`, csvContent);
  };

  const handlePrevDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsEditing(false);
    setShowDetailModal(true);
  };

  const filteredLogs = dailyLogs.filter(log =>
    (log.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.employee_id?.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Attendance Logs</h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Track and manage daily punch records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button onClick={() => setView('daily')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'daily' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}>Daily</button>
            <button onClick={() => setView('monthly')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'monthly' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}>Monthly</button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-6">
        <div className="card grid grid-cols-2 lg:flex items-center justify-between gap-4 p-6 lg:p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{selectedShift === 'All Shifts' ? employees.length : employees.filter(e => e.shift === selectedShift).length}</h4>
          </div>
          <div className="hidden lg:block h-12 w-px bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Present</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{dailyLogs.filter(l => l.status?.toLowerCase() === 'present' || l.status?.toLowerCase() === 'late').length}</h4>
          </div>
          <div className="hidden lg:block h-12 w-px bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Absent</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{(selectedShift === 'All Shifts' ? employees.length : employees.filter(e => e.shift === selectedShift).length) - dailyLogs.filter(l => l.status?.toLowerCase() === 'present' || l.status?.toLowerCase() === 'late' || l.status?.toLowerCase() === 'half_day').length}</h4>
          </div>
          <div className="hidden lg:block h-12 w-px bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Late</p>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{dailyLogs.filter(l => l.status?.toLowerCase() === 'late').length}</h4>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name or ID..." className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="flex items-center gap-2">
              <input type="date" className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600" value={currentDate.toISOString().split('T')[0]} onChange={(e) => setCurrentDate(new Date(e.target.value))} />
              <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600">
                <option>All Shifts</option>
                <option>Morning Shift</option><option>Evening Shift</option><option>Night Shift</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowBulkModal(true)} className="btn-primary py-2.5 px-6 flex items-center gap-2 shadow-lg shadow-primary/20 text-[10px] uppercase font-black tracking-widest"><Plus size={18} /> Bulk Mark</button>
            <button onClick={() => setShowManualModal(true)} className="btn-secondary py-2.5 px-6 flex items-center gap-2 text-[10px] uppercase font-black tracking-widest border border-slate-100"><Clock size={18} /> Manual</button>
            <button onClick={() => setShowHolidayModal(true)} className="btn-secondary py-2.5 px-6 flex items-center gap-2 text-[10px] uppercase font-black tracking-widest border border-slate-100 bg-amber-50 text-amber-600 border-amber-100"><Calendar size={18} /> Holidays</button>
          </div>
        </div>

        {view === 'monthly' ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-6">
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
              ))}
              {getDaysInMonth(currentDate).map((date, i) => {
                if (!date) return <div key={`pad-${i}`} className="aspect-square bg-slate-50/50 rounded-2xl"></div>;
                const dStr = date.toISOString().split('T')[0];
                const isSelected = dStr === currentDate.toISOString().split('T')[0];
                return (
                  <button key={dStr} onClick={() => { setCurrentDate(date); setView('daily'); }} className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all border ${isSelected ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-slate-600 border-slate-100 hover:border-primary/30'}`}>
                    <span className="text-sm font-black">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr className="text-left border-b border-slate-100">
                    <th className="py-4 pl-8 font-black text-slate-400 text-[9px] uppercase tracking-widest">Employee</th>
                    <th className="py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest text-center">Status</th>
                    <th className="py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest">Clock Activity</th>
                    <th className="py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest text-center">Hours</th>
                    <th className="py-4 text-right pr-8 font-black text-slate-400 text-[9px] uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="5" className="py-20 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Database...</td></tr>
                  ) : employees
                    .filter(emp => selectedShift === 'All Shifts' || emp.shift === selectedShift)
                    .filter(emp => (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || String(emp.id).includes(searchQuery))
                    .length > 0 ? (
                    employees
                      .filter(emp => selectedShift === 'All Shifts' || emp.shift === selectedShift)
                      .filter(emp => (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || String(emp.id).includes(searchQuery))
                      .map((emp) => {
                        const log = dailyLogs.find(l => l.employee_id === emp.id);
                        const status = log ? log.status : 'Absent';
                        const holiday = holidays.find(h => h.holiday_date.split('T')[0] === currentDate.toISOString().split('T')[0]);

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 pl-8">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                  {emp.photo ? <img src={emp.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary font-black">{emp.name?.charAt(0)}</div>}
                                </div>
                                <div>
                                  <h4 className="text-[12px] font-black text-slate-700 leading-tight">{emp.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{emp.shift || 'General'}</p>
                                    {holiday && (
                                      <span className="text-[7px] font-black bg-amber-50 text-amber-600 px-1 rounded uppercase flex items-center gap-1">
                                        <Calendar size={8} /> {holiday.holiday_name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status?.toLowerCase() === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : status?.toLowerCase() === 'late' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{status}</span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                <span>{log?.in_time ? new Date(log.in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                <span className="opacity-30">→</span>
                                <span>{log?.out_time ? new Date(log.out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <span className="text-[11px] font-black text-slate-800">{log?.total_hours || '0.00'}h</span>
                            </td>
                            <td className="py-4 pr-8 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleViewDetails(log || { ...emp, employee_id: emp.id, status: 'Absent', date: currentDate.toISOString().split('T')[0] })} className="p-2 text-slate-400 hover:text-primary bg-white rounded-xl border border-slate-100"><Eye size={16} /></button>
                                <button onClick={() => { setSelectedLog(log || { ...emp, employee_id: emp.id, status: 'Absent', date: currentDate.toISOString().split('T')[0] }); setIsEditing(true); setShowDetailModal(true); }} className="p-2 text-slate-400 hover:text-amber-500 bg-white rounded-xl border border-slate-100"><Pencil size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr><td colSpan="5" className="py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No matching records</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Manual Modal */}
      <AnimatePresence>
        {showManualModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowManualModal(false); }}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="modal-box modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Manual Log</h3>
                <button onClick={() => setShowManualModal(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-xl border border-slate-100"><X size={18} /></button>
              </div>
              <div className="modal-body custom-scrollbar">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter by Shift</label>
                    <select 
                      value={manualShift} 
                      onChange={(e) => setManualShift(e.target.value)}
                      className="input-field bg-slate-50 border-slate-100 font-bold"
                    >
                      <option>All Shifts</option>
                      <option>Morning Shift</option>
                      <option>Evening Shift</option>
                      <option>Night Shift</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
                    <select required value={manualData.employeeId} onChange={(e) => setManualData({ ...manualData, employeeId: e.target.value })} className="input-field">
                      <option value="">Choose Staff Member...</option>
                      {employees
                        .filter(e => manualShift === 'All Shifts' || e.shift === manualShift)
                        .map(e => <option key={e.id} value={e.id}>{e.name} ({e.shift || 'General'})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                      <input type="date" required value={manualData.date} onChange={(e) => setManualData({ ...manualData, date: e.target.value })} className="input-field" /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                      <select value={manualData.status} onChange={(e) => setManualData({ ...manualData, status: e.target.value })} className="input-field">
                        <option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option>
                      </select></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Punch In</label>
                      <input type="time" required value={manualData.inTime} onChange={(e) => setManualData({ ...manualData, inTime: e.target.value })} className="input-field" /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Punch Out</label>
                      <input type="time" required value={manualData.outTime} onChange={(e) => setManualData({ ...manualData, outTime: e.target.value })} className="input-field" /></div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 mt-2">
                    {loading ? 'Saving...' : 'Confirm Manual Entry'}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowBulkModal(false); }}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Bulk Attendance</h3>
                <button onClick={() => setShowBulkModal(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-xl border border-slate-100"><X size={18} /></button>
              </div>
              <div className="modal-body custom-scrollbar">
                <form onSubmit={handleBulkSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                      <input type="date" required value={bulkData.date} onChange={(e) => setBulkData({ ...bulkData, date: e.target.value })} className="input-field" /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                      <select value={bulkData.status} onChange={(e) => setBulkData({ ...bulkData, status: e.target.value })} className="input-field">
                        <option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option>
                      </select></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Punch In</label>
                      <input type="time" required value={bulkData.inTime} onChange={(e) => setBulkData({ ...bulkData, inTime: e.target.value })} className="input-field" /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Punch Out</label>
                      <input type="time" required value={bulkData.outTime} onChange={(e) => setBulkData({ ...bulkData, outTime: e.target.value })} className="input-field" /></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <label className="text-[10px] font-black uppercase text-slate-400">Select Staff ({bulkData.employeeIds.length})</label>
                      <div className="flex items-center gap-2">
                        <select 
                          value={bulkShift} 
                          onChange={(e) => setBulkShift(e.target.value)}
                          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20"
                        >
                          <option>All Shifts</option>
                          <option>Morning Shift</option>
                          <option>Evening Shift</option>
                          <option>Night Shift</option>
                        </select>
                        <button 
                          type="button" 
                          onClick={() => {
                            const filtered = employees.filter(e => bulkShift === 'All Shifts' || e.shift === bulkShift);
                            const filteredIds = filtered.map(e => e.id);
                            setBulkData({ ...bulkData, employeeIds: filteredIds });
                          }} 
                          className="text-[10px] font-black text-primary uppercase whitespace-nowrap"
                        >
                          Select All
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-100 custom-scrollbar">
                      {employees
                        .filter(emp => bulkShift === 'All Shifts' || emp.shift === bulkShift)
                        .map(emp => (
                          <label key={emp.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" checked={bulkData.employeeIds.includes(emp.id)} onChange={(e) => {
                              const ids = e.target.checked ? [...bulkData.employeeIds, emp.id] : bulkData.employeeIds.filter(id => id !== emp.id);
                              setBulkData({ ...bulkData, employeeIds: ids });
                            }} className="rounded text-primary" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-bold text-slate-700 truncate">{emp.name}</span>
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{emp.shift || 'General'}</span>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading || bulkData.employeeIds.length === 0}
                    className="w-full btn-primary py-3 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50">
                    {loading ? 'Processing...' : 'Confirm Bulk Update'}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail / Edit Modal */}
      <AnimatePresence>
        {showDetailModal && selectedLog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDetailModal(false); }}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="modal-box modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                    {selectedLog.photo ? <img src={selectedLog.photo} className="w-full h-full object-cover" /> : <div className="text-lg font-black text-primary">{selectedLog.name?.charAt(0)}</div>}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 leading-tight">{selectedLog.name}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedLog.shift || 'General'}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-xl border border-slate-100"><X size={18} /></button>
              </div>
              <div className="modal-body custom-scrollbar">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase">Punch In</label>
                        <input type="datetime-local" className="input-field" value={formatForInput(selectedLog.in_time)} onChange={(e) => setSelectedLog({ ...selectedLog, in_time: e.target.value })} /></div>
                      <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase">Punch Out</label>
                        <input type="datetime-local" className="input-field" value={formatForInput(selectedLog.out_time)} onChange={(e) => setSelectedLog({ ...selectedLog, out_time: e.target.value })} /></div>
                    </div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase">Status</label>
                      <select className="input-field" value={selectedLog.status} onChange={(e) => setSelectedLog({ ...selectedLog, status: e.target.value })}>
                        <option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option>
                      </select></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl text-center"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">In</p><p className="text-sm font-black text-slate-800">{selectedLog.in_time ? new Date(selectedLog.in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p></div>
                      <div className="p-4 bg-slate-50 rounded-2xl text-center"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Out</p><p className="text-sm font-black text-slate-800">{selectedLog.out_time ? new Date(selectedLog.out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p></div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 uppercase">Total Duration</span><span className="text-sm font-black text-slate-800">{selectedLog.total_hours || '0.00'} Hours</span></div>
                    <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 uppercase">Status</span>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${selectedLog.status?.toLowerCase() === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{selectedLog.status}</span></div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="flex-1 btn-secondary py-2.5 text-[10px] uppercase font-black">Cancel</button>
                    <button onClick={handleUpdateAttendance} className="flex-1 btn-primary py-2.5 text-[10px] uppercase font-black">Save</button>
                  </>
                ) : (
                  <button onClick={() => setShowDetailModal(false)} className="flex-1 btn-secondary py-2.5 text-[10px] uppercase font-black tracking-widest">Close</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holiday Modal */}
      <AnimatePresence>
        {showHolidayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowHolidayModal(false); }}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="modal-box modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Public Holidays</h3>
                <button onClick={() => setShowHolidayModal(false)} className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-xl border border-slate-100"><X size={18} /></button>
              </div>
              <div className="modal-body custom-scrollbar space-y-5">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder="Holiday Name" value={newHoliday.name} onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })} className="input-field" />
                    <input type="date" value={newHoliday.date} onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })} className="input-field" />
                  </div>
                  <button onClick={async () => {
                    if (!newHoliday.name) return alert('Enter name');
                    try {
                      await api.post('/attendance/holidays', { name: newHoliday.name, date: newHoliday.date });
                      setNewHoliday({ name: '', date: new Date().toISOString().split('T')[0] });
                      fetchHolidays();
                    } catch (err) { alert('Failed'); }
                  }} className="w-full btn-primary py-3 font-black uppercase text-[10px] tracking-widest">Add Holiday</button>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming Holidays</p>
                  {holidays.map(h => (
                    <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-[11px] font-black text-slate-800">{h.holiday_name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(h.holiday_date).toLocaleDateString()}</p>
                      </div>
                      <button onClick={async () => {
                        try { await api.delete(`/attendance/holidays/${h.id}`); fetchHolidays(); }
                        catch (err) { alert('Failed to delete'); }
                      }} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"><X size={14} /></button>
                    </div>
                  ))}
                  {holidays.length === 0 && <p className="text-center py-4 text-[10px] font-black text-slate-300 uppercase">No holidays set</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowHolidayModal(false)} className="flex-1 btn-secondary py-2.5 text-[10px] uppercase font-black">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
