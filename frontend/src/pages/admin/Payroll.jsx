import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { 
  Wallet, 
  ArrowUpRight, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  TrendingUp,
  AlertCircle,
  X,
  ArrowRight,
  Printer,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleDownload } from '../../utils/export';

const Payroll = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const [payRes, settingsRes] = await Promise.all([
        api.get('/payroll'),
        api.get('/settings')
      ]);
      setPayrollData(payRes.data);
      setSettings(settingsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payroll:', err);
      setError('Failed to load payroll records.');
    } finally {
      setLoading(false);
    }
  };

  const [historyData, setHistoryData] = useState([]);
  
  useEffect(() => {
    if (showHistory) {
       fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/payroll');
      setHistoryData(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.patch(`/payroll/${id}`, { status: 'paid' });
      fetchPayroll();
    } catch (err) {
      console.error('Error marking paid:', err);
      alert('Failed to update status');
    }
  };

  const handleBulkApprove = async () => {
    try {
      const pending = payrollData.filter(p => p.status === 'pending');
      if (pending.length === 0) return alert('No pending payrolls found');
      
      setLoading(true);
      await Promise.all(pending.map(p => api.patch(`/payroll/${p.id}`, { status: 'paid' })));
      fetchPayroll();
      alert('All pending payrolls have been marked as PAID.');
    } catch (err) {
      console.error('Bulk pay failed:', err);
      alert('Bulk payment update failed');
    } finally {
      setLoading(false);
    }
  };

  const processCycle = async () => {
    try {
      setIsProcessing(true);
      const now = new Date();
      let startDate, endDate;

      const cycle = settings?.salary_cycle || 'Monthly (1st to 30th)';

      if (cycle === 'Weekly Payout') {
        // Last 7 days
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        startDate = start.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      } else if (cycle === '15 Days Cycle') {
        // 1st to 15th OR 16th to end of month
        if (now.getDate() <= 15) {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          endDate = new Date(now.getFullYear(), now.getMonth(), 15).toISOString().split('T')[0];
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 16).toISOString().split('T')[0];
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        }
      } else {
        // Monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      }
      
      console.log(`🚀 Processing ${cycle}: ${startDate} to ${endDate}`);
      await api.post('/payroll/generate', { startDate, endDate });
      setIsProcessing(false);
      setShowSuccess(true);
      fetchPayroll();
    } catch (err) {
      console.error('Payroll generation failed:', err);
      setIsProcessing(false);
      alert('Failed to process payroll cycle');
    }
  };

  const filteredData = payrollData.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    String(emp.id).toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll Management</h1>
          <p className="text-sm text-slate-500">Manage salaries, deductions, and payouts for the {settings?.salary_cycle || 'current cycle'}.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={processCycle}
            disabled={isProcessing}
            className="btn-primary flex items-center gap-2 relative overflow-hidden"
          >
            {isProcessing ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Clock size={18} />
              </motion.div>
            ) : <TrendingUp size={18} />}
            {isProcessing ? 'Processing...' : 'Process Cycle'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="card bg-gradient-to-br from-primary to-indigo-700 text-white border-none relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={120} />
          </div>
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Wallet size={24} />
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Current Cycle</span>
          </div>
          <div className="relative z-10">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-wider">Total Net Payout</p>
            <h3 className="text-4xl font-extrabold mt-2 tracking-tight">
              R{payrollData.reduce((acc, curr) => acc + parseFloat(curr.net_salary || 0), 0).toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-white/80">
              <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
                <ArrowUpRight size={14} /> +15.2%
              </span>
              <span>vs last cycle</span>
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-3 card grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 py-8">
          <div className="flex flex-col items-center justify-center sm:border-r border-slate-100 px-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Total Work Hours</p>
            <h4 className="text-2xl font-extrabold text-slate-800">
              {payrollData.reduce((acc, curr) => acc + parseFloat(curr.total_hours || 0), 0).toFixed(1)}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">Across {payrollData.length} employees</p>
          </div>
          <div className="flex flex-col items-center justify-center xl:border-r border-slate-100 px-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Avg. Hourly Rate</p>
            <h4 className="text-2xl font-extrabold text-slate-800">
              R{payrollData.length > 0 
                ? (payrollData.reduce((acc, curr) => acc + parseFloat(curr.salary_rate || curr.base_salary || 0), 0) / payrollData.length).toFixed(0)
                : '0'}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">Calculated from cycle</p>
          </div>
          <div className="flex flex-col items-center justify-center sm:border-r border-slate-100 px-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Total UIF (1%)</p>
            <h4 className="text-2xl font-extrabold text-amber-600">
              R{payrollData.reduce((acc, curr) => acc + parseFloat(curr.uif_amount || 0), 0).toLocaleString()}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">Statutory Contribution</p>
          </div>
          <div className="flex flex-col items-center justify-center px-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Total Deductions</p>
            <h4 className="text-2xl font-extrabold text-rose-500">
              R{payrollData.reduce((acc, curr) => acc + parseFloat(curr.deductions || 0) + parseFloat(curr.advance_deduction || 0), 0).toLocaleString()}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">Late / Absence / Advance</p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by employee name..." 
              className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-10 py-2 text-sm w-full focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={handleBulkApprove}
            disabled={loading}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-none flex items-center gap-2 shadow-lg shadow-emerald-600/20 py-3"
          >
            <Wallet size={18} />
            Bulk Pay All Pending
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50">
                <th className="pb-4 pl-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Employee</th>
                <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Work Hours</th>
                <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Base Salary</th>
                <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Late Ded.</th>
                <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">UIF (1%)</th>
                <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Advance</th>
                <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Net Pay</th>
                <th className="pb-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Status</th>
                <th className="pb-4 text-right pr-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Calculating Payouts...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-rose-500 uppercase text-xs font-black">
                    {error}
                  </td>
                </tr>
              ) : filteredData.map((row, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                         {row.photo ? (
                           <img src={row.photo} alt="user" className="w-full h-full object-cover" />
                         ) : (
                           <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`} alt="user" className="w-full h-full object-cover" />
                         )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{row.name}</p>
                        <p className="text-[10px] font-semibold text-slate-400">ID: {row.employee_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-bold text-slate-600">{row.total_hours || '0.00'} hrs</td>
                  <td className="py-4 text-sm font-bold text-slate-600">R{parseFloat(row.base_salary || row.salary_rate || 0).toLocaleString()}</td>
                  <td className="py-4 text-sm font-bold text-rose-500">R{parseFloat(row.deductions || 0).toLocaleString()}</td>
                  <td className="py-4 text-sm font-bold text-amber-600">R{parseFloat(row.uif_amount || 0).toLocaleString()}</td>
                  <td className="py-4 text-sm font-bold text-indigo-600">R{parseFloat(row.advance_deduction || 0).toLocaleString()}</td>
                  <td className="py-4 text-sm font-extrabold text-slate-800">R{parseFloat(row.net_salary || 0).toLocaleString()}</td>
                  <td className="py-4">
                    {row.status === 'pending' ? (
                      <button 
                        onClick={() => handleMarkPaid(row.id)}
                        className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        PAY NOW
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1 w-fit">
                        <CheckCircle2 size={10} /> PAID
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <button 
                      onClick={() => { setSelectedSlip(row); setShowSlipModal(true); }}
                      className="p-2 bg-slate-50 rounded-xl text-primary hover:bg-primary/10 transition-colors group-hover:scale-110 shadow-sm border border-slate-100"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} />
              </div>
              <p className="text-slate-500 font-bold">No employees found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={() => setShowHistory(false)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Payroll History</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Previous cycles</p>
                  </div>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="modal-body custom-scrollbar space-y-4">
                {historyData.length > 0 ? historyData.map((item, i) => (
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-primary/20 transition-all">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.cycle}</p>
                      <h4 className="text-lg font-black text-slate-800">{item.total}</h4>
                      <p className="text-[10px] font-bold text-slate-500">Paid on {item.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">{item.status}</span>
                      <button className="p-2 bg-white rounded-xl text-slate-400 hover:text-primary transition-colors shadow-sm">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center text-xs font-black text-slate-300 uppercase tracking-widest">
                    No payroll history found
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowHistory(false)} className="w-full btn-secondary py-2.5 text-[10px] font-black uppercase">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Process Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={() => setShowSuccess(false)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="modal-box modal-sm p-10 text-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Cycle Processed!</h3>
              <p className="text-sm text-slate-500 mb-8 px-4">
                The {settings?.salary_cycle || 'payroll cycle'} has been processed successfully. Payouts are scheduled for distribution.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowSuccess(false)} className="flex-1 btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-widest">Done</button>
                <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-600 transition-colors">
                  <Printer size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Pay Slip Modal */}
      <AnimatePresence>
        {showSlipModal && selectedSlip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={() => setShowSlipModal(false)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Salary Slip</h3>
                <button onClick={() => setShowSlipModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <div className="modal-body custom-scrollbar print:p-0" id="printable-slip">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 border-b-2 border-slate-900 pb-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">SALARY SLIP</h2>
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mt-2">Private & Confidential</p>
                    <div className="flex items-center gap-4 mt-4">
                       <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1 uppercase"><Clock size={10} /> Generated: {new Date().toLocaleDateString()}</p>
                       <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1 uppercase">Cycle: {selectedSlip.cycle || 'Monthly'}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{settings?.business_name || 'BIOTRACK PRO'}</h3>
                    <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase max-w-[250px] leading-relaxed">{settings?.business_address || '123 Business Road, Corporate Plaza'}</p>
                    <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase">{settings?.business_phone} | {settings?.business_email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-y border-slate-100 mb-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Details</p>
                    <h4 className="text-lg font-black text-slate-800">{selectedSlip.name}</h4>
                    <p className="text-xs font-bold text-slate-600 uppercase">ID: {selectedSlip.employee_id}</p>
                    <p className="text-xs font-bold text-slate-600 uppercase">Status: {selectedSlip.status}</p>
                  </div>
                  <div className="text-left sm:text-right space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Cycle</p>
                    <h4 className="text-sm font-black text-slate-800">{selectedSlip.cycle || 'Monthly Cycle'}</h4>
                    <p className="text-xs font-bold text-slate-600 uppercase">Hours: {selectedSlip.total_hours}h</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3 pb-2 border-b border-slate-50">Earnings Breakdown</h5>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-bold text-slate-600">Base Salary</span>
                      <span className="text-xs font-black text-slate-800">R{parseFloat(selectedSlip.base_salary).toLocaleString() || '0'}</span>
                    </div>
                    {selectedSlip.overtime > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-bold text-slate-600">Overtime</span>
                        <span className="text-xs font-black text-slate-800">R{parseFloat(selectedSlip.overtime).toLocaleString() || '0'}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3 bg-slate-50 px-3 rounded-lg mt-2">
                      <span className="text-xs font-black text-slate-800">Total Gross</span>
                      <span className="text-xs font-black text-slate-800">R{(parseFloat(selectedSlip.base_salary) + parseFloat(selectedSlip.overtime || 0)).toLocaleString() || '0'}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 pb-2 border-b border-rose-50">Deductions</h5>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-bold text-slate-600">Late / Absence Deductions</span>
                      <span className="text-xs font-black text-rose-500">R{parseFloat(selectedSlip.deductions).toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-bold text-slate-600">UIF (1% Gross)</span>
                      <span className="text-xs font-black text-rose-500">R{parseFloat(selectedSlip.uif_amount || 0).toLocaleString() || '0'}</span>
                    </div>
                    {selectedSlip.advance_deduction > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-bold text-slate-600">Advance Repayment</span>
                        <span className="text-xs font-black text-rose-500">R{parseFloat(selectedSlip.advance_deduction).toLocaleString() || '0'}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-primary text-white rounded-3xl mt-8 shadow-xl shadow-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Net Payout</p>
                        <h3 className="text-3xl font-black tracking-tighter mt-1">R{parseFloat(selectedSlip.net_salary).toLocaleString() || '0'}</h3>
                      </div>
                      <CheckCircle2 size={40} className="opacity-20" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowSlipModal(false)} className="btn-secondary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">Close</button>
                <button onClick={() => handleDownload(`${selectedSlip.name}_Slip.pdf`, 'printable-slip')} className="btn-primary flex items-center gap-2 py-2.5 px-6 text-[10px] font-black uppercase tracking-widest"><Download size={18} /> Download PDF</button>
                <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 py-2.5 px-6 text-[10px] font-black uppercase tracking-widest"><Printer size={18} /> Print</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payroll;
