import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Calendar, 
  ShieldCheck, 
  Save,
  Wifi,
  Fingerprint,
  Globe,
  Clock,
  Lock,
  Zap,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('device');
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    machine_ip: '',
    machine_port: 4370,
    machine_alias: '',
    sync_interval: 30,
    late_deduction: true,
    late_deduction_amount: 50,
    salary_cycle: '15 Days Cycle',
    ot_multiplier: 1.5,
    standard_start_time: '08:00',
    admin_password: '',
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: ''
  });

  const tabs = [
    { id: 'device', label: 'Device Configuration', icon: <Cpu size={20} /> },
    { id: 'payroll', label: 'Payroll & Rules', icon: <Calendar size={20} /> },
    { id: 'business', label: 'Business Profile', icon: <Globe size={20} /> },
    { id: 'security', label: 'Security & Admin', icon: <ShieldCheck size={20} /> },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings({
        ...response.data,
        late_deduction: !!response.data.late_deduction,
        admin_password: '' // Don't show password
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.put('/settings', settings);
      setIsSaving(false);
      alert('Settings updated successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setIsSaving(false);
      alert('Failed to update settings');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your biometric integration and payroll business rules.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center justify-center gap-2 px-8 py-3 shadow-lg shadow-primary/20 relative overflow-hidden"
        >
          {isSaving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Zap size={18} />
            </motion.div>
          ) : <Save size={18} />}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-3 space-y-1">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-black transition-all group ${
                  activeTab === tab.id 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className={`transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`}>
                  {tab.icon}
                </div>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
               <Fingerprint size={80} />
            </div>
            <div className="relative z-10 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary-light">System Status</h4>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div>
                 <p className="text-sm font-bold text-slate-200">Biometric Machine: Offline</p>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                Firmware: ---<br/>
                API Status: Not Connected
              </p>
            </div>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'device' && (
              <motion.div 
                key="device"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="card">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-50">
                    <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-sm">
                      <Cpu size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Biometric Machine Config</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect and sync with hardware</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Device IP Address</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="text" 
                          name="machine_ip"
                          value={settings.machine_ip}
                          onChange={handleChange}
                          placeholder="0.0.0.0" 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Communication Port</label>
                      <input 
                        type="number" 
                        name="machine_port"
                        value={settings.machine_port}
                        onChange={handleChange}
                        placeholder="4370" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Machine Alias Name</label>
                      <input 
                        type="text" 
                        name="machine_alias"
                        value={settings.machine_alias}
                        onChange={handleChange}
                        placeholder="Main Entrance Device" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sync Interval (Seconds)</label>
                      <div className="relative">
                         <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                         <input 
                           type="number" 
                           name="sync_interval"
                           value={settings.sync_interval}
                           onChange={handleChange}
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                         />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-4 rounded-2xl text-slate-400 shadow-xl shadow-slate-500/10">
                        <Wifi size={28} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-800 tracking-tight">Machine Disconnected</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hardware not detected</p>
                      </div>
                    </div>
                    <button className="w-full md:w-auto text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-white px-8 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/5 hover:scale-105 active:scale-95 transition-all border border-emerald-200/50">
                      Test Link Connection
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payroll' && (
              <motion.div 
                key="payroll"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="card">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-50">
                    <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-600 shadow-sm">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Attendance & Payout Logic</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business rules for salary calculation</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="group flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-all">
                      <div className="space-y-1">
                        <h4 className="text-base font-black text-slate-800">Automatic Late Deduction</h4>
                        <p className="text-xs font-bold text-slate-500">Enable 15-minute buffer before deducting half-day or late fine.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, late_deduction: !prev.late_deduction }))}
                        className={`w-14 h-7 rounded-full relative transition-all p-1.5 shadow-lg ${settings.late_deduction ? 'bg-primary shadow-primary/20' : 'bg-slate-300'}`}
                      >
                        <motion.div 
                          animate={{ x: settings.late_deduction ? 28 : 0 }}
                          className="h-4 w-4 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>

                    {settings.late_deduction && (
                      <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-rose-900">Late Penalty Amount</h4>
                            <p className="text-[10px] font-bold text-rose-600/80">Amount to deduct per late arrival.</p>
                          </div>
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-xs">R</span>
                            <input 
                              type="number"
                              name="late_deduction_amount"
                              value={settings.late_deduction_amount}
                              onChange={handleChange}
                              className="w-full bg-white border border-rose-200 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Salary Payout Cycle</label>
                        <select 
                          name="salary_cycle"
                          value={settings.salary_cycle}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 appearance-none"
                        >
                          <option value="15 Days Cycle">15 Days Cycle</option>
                          <option value="Monthly (1st to 30th)">Monthly (1st to 30th)</option>
                          <option value="Weekly Payout">Weekly Payout</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">OT (Overtime) Multiplier</label>
                        <input 
                          type="number" 
                          step="0.1"
                          name="ot_multiplier"
                          value={settings.ot_multiplier}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Standard Start Time</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            type="time" 
                            name="standard_start_time"
                            value={settings.standard_start_time}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="p-4 bg-white/10 rounded-2xl text-primary-light">
                           <Fingerprint size={32} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black tracking-tight">Biometric Push API</h4>
                          <p className="text-xs font-bold text-slate-400">Secure Webhook for real-time machine logs</p>
                        </div>
                      </div>
                      <div className="relative z-10 w-full md:w-auto">
                         <code className="block w-full text-[10px] font-bold bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-primary-light truncate max-w-[280px]">https://api.biotrack.pro/v1/machine-log</code>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'business' && (
              <motion.div 
                key="business"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="card">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-50">
                    <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-600 shadow-sm">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Business Identity</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company details for reports & payslips</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Business Name</label>
                      <input 
                        type="text" 
                        name="business_name"
                        value={settings.business_name}
                        onChange={handleChange}
                        placeholder="Company Name Ltd." 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Phone</label>
                      <input 
                        type="text" 
                        name="business_phone"
                        value={settings.business_phone}
                        onChange={handleChange}
                        placeholder="+27 00 000 0000" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                      <input 
                        type="email" 
                        name="business_email"
                        value={settings.business_email}
                        onChange={handleChange}
                        placeholder="hr@company.com" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Physical Address</label>
                      <textarea 
                        name="business_address"
                        value={settings.business_address}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Street, City, Province, Code" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="card">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-50">
                    <div className="bg-rose-500/10 p-3 rounded-2xl text-rose-600 shadow-sm">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Security & Access Control</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage administrative safety</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Admin Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            type="password" 
                            name="admin_password"
                            value={settings.admin_password}
                            onChange={handleChange}
                            placeholder="Enter new password" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Two-Factor Auth</label>
                        <button className="w-full bg-slate-900 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Enable 2FA Access</button>
                      </div>
                    </div>

                    <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 flex items-start gap-5">
                       <div className="p-3 bg-white rounded-2xl text-rose-600 shadow-sm shrink-0">
                          <AlertCircle size={24} />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-rose-900">Critical: Reset Machine Cache</h4>
                          <p className="text-xs font-bold text-rose-600/80 leading-relaxed mt-1">If employee fingerprints are not syncing, use this to force-clear the local machine buffer and re-download all templates.</p>
                          <button className="mt-4 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20">Purge & Sync Now</button>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
