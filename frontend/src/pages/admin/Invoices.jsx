import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { 
  FileText, 
  Download, 
  Printer, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  CreditCard,
  Search,
  X,
  ChevronRight
} from 'lucide-react';
import { handleDownload } from '../../utils/export';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Invoices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('');

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, payrollRes, settingsRes] = await Promise.all([
        api.get('/employees'),
        api.get('/payroll'),
        api.get('/settings')
      ]);
      setEmployees(empRes.data);
      setPayrollRecords(payrollRes.data);
      setSettings(settingsRes.data);
      if (empRes.data.length > 0) {
        setSelectedEmpId(empRes.data[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data for invoices:', err);
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    String(emp.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  const currentPayroll = payrollRecords.find(p => p.employee_id === selectedEmpId);

  // PDF generation removed as per user request to use system print
  const generatePDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoices & Payslips</h1>
          <p className="text-sm text-slate-500">Preview and manage generated employee salary slips.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Employee List Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="card flex flex-col h-auto lg:h-[650px] overflow-hidden p-0">
            <div className="p-6 border-b border-slate-50 shrink-0">
              <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">Generated Payslips</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employee..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-10 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Records...</p>
                </div>
              ) : filteredEmployees.map((item) => {
                  const payroll = payrollRecords.find(p => p.employee_id === item.id);
                  return (
                    <button 
                      key={item.id} 
                      onClick={() => setSelectedEmpId(item.id)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left group ${
                        selectedEmpId === item.id 
                        ? 'bg-primary/5 border border-primary/20 shadow-sm' 
                        : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border ${
                        selectedEmpId === item.id ? 'border-primary/20 scale-110' : 'border-slate-100'
                      }`}>
                        <img 
                          src={item.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${selectedEmpId === item.id ? 'text-primary' : 'text-slate-800'}`}>
                          {item.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.department || 'Staff'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800">{payroll ? `R${parseFloat(payroll.net_salary || 0).toLocaleString()}` : '---'}</p>
                      </div>
                    </button>
                  );
              })}
            </div>
          </div>
        </div>

        {/* Payslip Preview Container */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedEmpId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card bg-white shadow-2xl border-slate-200 relative overflow-hidden p-0"
              id="payslip-content"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <div className="bg-primary text-white p-3 rounded-2xl inline-block mb-4 shadow-lg shadow-primary/20">
                      <FileText size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">SALARY SLIP</h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-widest mt-1 bg-primary/5 px-2 py-0.5 rounded-md inline-block">
                       PERIOD: {currentPayroll ? new Date(currentPayroll.cycle_start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '---'} TO {currentPayroll ? new Date(currentPayroll.cycle_end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3 no-print">
                    <div className="text-right mb-2">
                      <h3 className="text-sm font-black text-primary uppercase tracking-widest leading-none">{settings?.business_name || 'BioTrack Pro'}</h3>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Official Payout Record</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase max-w-[200px]">{settings?.business_address}</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{settings?.business_phone} | {settings?.business_email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => window.print()} className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Printer size={16} /> Print Payslip
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 py-8 border-y border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-md shrink-0">
                      <img 
                        src={selectedEmployee?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee?.name || 'User')}&background=random`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</h4>
                      <p className="text-lg font-black text-slate-800">{selectedEmployee?.name || '---'}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Machine ID: {selectedEmployee?.machine_id || '---'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</h4>
                      <p className="text-sm font-bold text-slate-800">{selectedEmployee?.department || 'General'}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Shift</h4>
                      <p className="text-sm font-bold text-slate-800">{selectedEmployee?.shift || 'Morning'}</p>
                    </div>
                  </div>
                </div>

                {currentPayroll ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            Earnings Breakdown <CheckCircle2 size={12} />
                          </h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-bold">Total Work Hours</span>
                              <span className="text-slate-800 font-black">{parseFloat(currentPayroll.total_hours).toFixed(2)} Hrs</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-bold">Rate ({selectedEmployee?.salary_type})</span>
                              <span className="text-slate-800 font-black">R{parseFloat(selectedEmployee?.salary_rate || 0).toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-black">Basic Gross Pay</span>
                              <span className="text-slate-800 font-black">R{parseFloat(currentPayroll.base_salary || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {currentPayroll.shifts && currentPayroll.shifts.length > 0 && (
                          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Shift Details & UIF</h4>
                             <table className="w-full text-[10px]">
                                <thead>
                                   <tr className="text-left text-slate-400 border-b border-slate-100">
                                      <th className="pb-2">Date</th>
                                      <th className="pb-2">Earning</th>
                                      <th className="pb-2 text-right">UIF (1%)</th>
                                   </tr>
                                </thead>
                                <tbody className="text-slate-600">
                                   {currentPayroll.shifts.map((s, i) => (
                                      <tr key={i} className="border-b border-slate-50 last:border-0">
                                         <td className="py-2">{new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                                         <td className="py-2 font-bold">R{parseFloat(s.earning).toFixed(0)}</td>
                                         <td className="py-2 text-right font-black text-rose-500">R{parseFloat(s.uif || 0).toFixed(2)}</td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          Deductions <AlertCircle size={12} />
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold">Attendance Penalties</span>
                            <span className="text-rose-600 font-black">R{parseFloat(currentPayroll.deductions).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold">Total UIF Contribution</span>
                            <span className="text-rose-600 font-black">R{parseFloat(currentPayroll.uif_amount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-bold">Advance Deduction</span>
                            <span className="text-rose-600 font-black">R{parseFloat(currentPayroll.advance_deduction || 0).toLocaleString()}</span>
                          </div>
                          <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-black">Total Reductions</span>
                            <span className="text-rose-600 font-black">R{(parseFloat(currentPayroll.deductions) + parseFloat(currentPayroll.uif_amount || 0) + parseFloat(currentPayroll.advance_deduction || 0)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between text-white gap-4 shadow-2xl relative overflow-hidden">
                       <div className="relative z-10 text-center md:text-left">
                          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Net Salary Disbursed</p>
                          <p className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block ${currentPayroll.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                             {currentPayroll.status.toUpperCase()}
                          </p>
                       </div>
                       <div className="text-right relative z-10">
                          <h3 className="text-5xl font-black tracking-tighter text-white">R{parseFloat(currentPayroll.net_salary || 0).toLocaleString()}</h3>
                       </div>
                    </div>
                    
                    <div className="mt-12 flex justify-between items-end border-t border-slate-100 pt-8">
                       <div className="text-center">
                          <div className="h-16 w-48 border-b border-slate-200 mb-2 flex items-end justify-center">
                             {selectedEmployee?.signature ? (
                               <img src={selectedEmployee.signature} className="max-h-full object-contain mb-1" />
                             ) : (
                               <span className="text-[9px] text-slate-300 font-bold uppercase mb-2">Employee Signature</span>
                             )}
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Received By</p>
                       </div>
                       <div className="text-center">
                          <div className="h-16 w-48 border-b border-slate-200 mb-2 flex items-end justify-center">
                             <div className="text-primary font-black text-2xl italic tracking-tighter opacity-10 mb-2">APPROVED</div>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized By</p>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
                    <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
                    <h4 className="text-xl font-black text-slate-400 uppercase">Payslip Not Available</h4>
                  </div>
                )}

                <div className="mt-12 text-center text-[8px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                   Generated on {new Date().toLocaleString()}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
