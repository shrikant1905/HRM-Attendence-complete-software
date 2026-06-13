import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { 
  Wallet, 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  FileText,
  TrendingUp,
  AlertCircle,
  Calendar,
  Printer,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleDownload } from '../../utils/export';

const MySalary = () => {
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      fetchMySalary(u.id || u.userId);
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {}
  };

  const fetchMySalary = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get('/payroll');
      // Backend already filters by employee_id for 'employee' role
      const myData = response.data[0]; 
      setSalaryData(myData);
    } catch (err) {
      console.error('Error fetching my salary:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Salary</h1>
          <p className="text-sm text-slate-500">Track your earnings, deductions and payouts.</p>
        </div>
        <button 
          onClick={() => setShowSlipModal(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Download size={18} />
          View & Download Slip
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card bg-slate-900 text-white border-none relative overflow-hidden">
          <div className="relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl w-fit mb-8 border border-white/10">
              <Wallet size={24} className="text-primary-light" />
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Current 15-Day Cycle</p>
            <h3 className="text-4xl font-black mt-2 tracking-tight">{loading ? '...' : (salaryData?.net_salary ? `R${parseFloat(salaryData.net_salary).toLocaleString()}` : 'R0')}</h3>
            <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Payment Status</p>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <Clock size={16} /> {salaryData?.status?.toUpperCase() || 'PENDING'}
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Cycle End</p>
                <p className="text-sm font-bold">{salaryData?.cycle_end ? new Date(salaryData.cycle_end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '---'}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        </div>

        <div className="lg:col-span-2 card grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Earnings Breakdown</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Gross Earnings</span>
                <span className="text-sm font-bold text-slate-800">R{parseFloat(salaryData?.gross_earnings || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Hourly/Daily Rate</span>
                <span className="text-sm font-bold text-slate-800">R{parseFloat(salaryData?.base_salary || salaryData?.salary_rate || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Total Hours</span>
                <span className="text-sm font-bold text-slate-800">{salaryData?.total_hours || 0} hrs</span>
              </div>
            </div>
          </div>
          <div className="space-y-6 md:border-l md:border-slate-50 md:pl-8">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Deductions</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">UIF (1%)</span>
                <span className="text-sm font-bold text-rose-500">-R{parseFloat(salaryData?.uif_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Advance Deductions</span>
                <span className="text-sm font-bold text-rose-500">-R{parseFloat(salaryData?.advance_deduction || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Total Deductions</span>
                <span className="text-sm font-bold text-rose-500">-R{(parseFloat(salaryData?.deductions || 0) + parseFloat(salaryData?.uif_amount || 0) + parseFloat(salaryData?.advance_deduction || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
          Salary History <FileText size={16} className="text-primary" />
        </h3>
        <div className="space-y-3">
          <div className="py-10 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
            No salary history available
          </div>
        </div>
      </div>

      {/* Pay Slip Modal */}
      <AnimatePresence>
        {showSlipModal && salaryData && (
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
                       <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1 uppercase">Cycle: {salaryData.cycle || 'Monthly'}</p>
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
                    <h4 className="text-lg font-black text-slate-800">{salaryData.name}</h4>
                    <p className="text-xs font-bold text-slate-600 uppercase">ID: {salaryData.employee_id}</p>
                    <p className="text-xs font-bold text-slate-600 uppercase">Status: {salaryData.status}</p>
                  </div>
                  <div className="text-left sm:text-right space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Cycle</p>
                    <h4 className="text-sm font-black text-slate-800">{salaryData.cycle || 'Monthly Cycle'}</h4>
                    <p className="text-xs font-bold text-slate-600 uppercase">Hours: {salaryData.total_hours}h</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3 pb-2 border-b border-slate-50">Earnings Breakdown</h5>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-bold text-slate-600">Gross Salary</span>
                      <span className="text-xs font-black text-slate-800">R{parseFloat(salaryData.gross_earnings).toLocaleString() || '0'}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 pb-2 border-b border-rose-50">Deductions</h5>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-bold text-slate-600">Late / Absence Deductions</span>
                      <span className="text-xs font-black text-rose-500">R{parseFloat(salaryData.deductions || 0).toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-bold text-slate-600">UIF (1% Gross)</span>
                      <span className="text-xs font-black text-rose-500">R{parseFloat(salaryData.uif_amount || 0).toLocaleString() || '0'}</span>
                    </div>
                    {salaryData.advance_deduction > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-bold text-slate-600">Advance Repayment</span>
                        <span className="text-xs font-black text-rose-500">R{parseFloat(salaryData.advance_deduction).toLocaleString() || '0'}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-primary text-white rounded-3xl mt-8 shadow-xl shadow-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Net Payout</p>
                        <h3 className="text-3xl font-black tracking-tighter mt-1">R{parseFloat(salaryData.net_salary).toLocaleString() || '0'}</h3>
                      </div>
                      <CheckCircle2 size={40} className="opacity-20" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowSlipModal(false)} className="btn-secondary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">Close</button>
                <button onClick={() => handleDownload(`${salaryData.name}_Slip.pdf`, 'printable-slip')} className="btn-primary flex items-center gap-2 py-2.5 px-6 text-[10px] font-black uppercase tracking-widest"><Download size={18} /> Download PDF</button>
                <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 py-2.5 px-6 text-[10px] font-black uppercase tracking-widest"><Printer size={18} /> Print</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MySalary;
