import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/axios';
import {
  Plus,
  Users,
  Search,
  Filter,
  MoreVertical,
  Download,
  Mail,
  Phone,
  Calendar,
  Shield,
  X,
  Edit2,
  Trash2,
  Eye,
  UserPlus,
  Briefcase,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Building,
  TrendingUp,
  Image as ImageIcon,
  PenTool,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';

const Employees = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState('All Shifts');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextIds, setNextIds] = useState({ custom_id: '', machine_id: '' });

  const fetchNextIds = async (baseData = null) => {
    try {
      const response = await api.get('/employees/next-ids');
      const { nextCustomId, nextMachineId } = response.data;
      
      setNextIds({
        custom_id: nextCustomId,
        machine_id: nextMachineId
      });

      // Update form data - if baseData provided, use it to avoid race conditions
      setFormData(prev => ({
        ...(baseData || prev),
        custom_id: nextCustomId,
        machine_id: nextMachineId
      }));
    } catch (err) {
      console.error('Failed to fetch next IDs', err);
    }
  };

  // Signature States
  const sigPad = useRef(null);
  const [signatureType, setSignatureType] = useState('upload'); // 'draw' | 'upload'

  useEffect(() => {
    fetchEmployees();
    fetchNextIds();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(emp.machine_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(emp.custom_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift = selectedShift === 'All Shifts' || emp.shift === selectedShift;
    return matchesSearch && matchesShift;
  });

  const [formData, setFormData] = useState({
    machine_id: '',
    name: '',
    role: 'employee',
    department: 'General',
    shift: 'Morning Shift',
    email: '',
    phone: '',
    salary_rate: '',
    salary_type: 'hourly',
    password: '',
    joined_date: new Date().toISOString().split('T')[0],
    photo: null,
    profileImage: null,
    uif_number: '',
    advance_balance: 0,
    signature: null,
    custom_id: '',
    status: 'active',
    is_uif_registered: true
  });

  const [previewImage, setPreviewImage] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) return alert('Only JPG, JPEG and PNG formats are allowed');
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, signature: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const saveDrawnSignature = () => {
    if (sigPad.current.isEmpty()) return;
    const base64 = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    setFormData(prev => ({ ...prev, signature: base64 }));
    setSignatureType('upload');
  };

  const clearSignature = () => {
    sigPad.current?.clear();
    setFormData(prev => ({ ...prev, eSignature: null }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers for Employee ID (custom_id)
    if (name === 'custom_id') {
      const val = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: val }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (isUpdate = false) => {
    try {
      setLoading(true);
      // Auto-capture drawn signature if user forgot to click "Save Drawn"
      let finalSignature = formData.signature;
      if (!finalSignature && signatureType === 'draw' && sigPad.current) {
        try {
          // Check if it's the expected object and has the method
          const pad = sigPad.current;
          if (pad && typeof pad.isEmpty === 'function' && !pad.isEmpty()) {
            finalSignature = pad.toDataURL();
            console.log('✅ Signature captured automatically');
          }
        } catch (sigErr) {
          console.error('❌ Signature capture failed:', sigErr);
        }
      }

      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'profileImage' && formData[key]) {
          data.append('profileImage', formData[key]);
        } else if (key === 'signature') {
          if (finalSignature) data.append('signature', finalSignature);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      console.log('🚀 Final Signature Size:', finalSignature ? finalSignature.length : 'EMPTY');

      if (isUpdate) {
        await api.put(`/employees/${selectedEmployee.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/employees', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        // Refresh next IDs after successful addition
        await fetchNextIds();
      }

      await fetchEmployees();
      setActiveModal(null);
      setPreviewImage(null);
    } catch (err) {
      console.error('Submission failed:', err);
      const msg = err.response?.data?.message || 'Failed to save profile. Please check if IDs are unique.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/employees/${selectedEmployee.id}`);
      await fetchEmployees();
      setActiveModal(null);
    } catch (err) {
      alert('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Personnel Directory</h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">Manage admins and staff members</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const initialData = {
                machine_id: nextIds.machine_id || '', 
                name: '', role: 'employee', department: 'General', shift: 'Morning Shift',
                email: '', phone: '', salary_rate: '0', salary_type: 'hourly',
                password: '', joined_date: new Date().toISOString().split('T')[0],
                uif_number: '', advance_balance: 0, signature: null, 
                custom_id: '', // Leave blank for manual entry
                status: 'active', profileImage: null,
                is_uif_registered: true, photo: null
              };
              setFormData(initialData);
              setPreviewImage(null);
              setSignatureType('draw');
              setActiveModal('add');
              // Refresh next IDs in background
              fetchNextIds(initialData);
            }}
            className="btn-primary flex items-center gap-2 py-2 px-4 shadow-lg shadow-primary/20"
          >
            <UserPlus size={16} />
            <span>Add New Personnel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card !p-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID or email..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-10 py-2.5 text-[12px] font-bold"
            />
          </div>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11px] font-black text-slate-500 uppercase tracking-widest h-[42px]"
          >
            <option>All Shifts</option>
            <option>Morning Shift</option><option>Evening Shift</option><option>Night Shift</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-50/50">
              <tr className="text-left border-b border-slate-100">
                <th className="py-4 pl-4 font-black text-slate-400 text-[9px] uppercase tracking-widest w-12">SR No.</th>
                <th className="py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest">Personnel Info</th>
                <th className="py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest">Role</th>
                <th className="py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest text-center">Status</th>
                <th className="py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest">Date Joined</th>
                <th className="py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest text-center">Earnings</th>
                <th className="py-4 text-right pr-4 font-black text-slate-400 text-[9px] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="7" className="py-20 text-center text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Fetching Data...</td></tr>
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan="7" className="py-20 text-center text-xs font-black text-slate-400 uppercase tracking-widest">No records found</td></tr>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <tr key={emp.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-4 text-[10px] font-black text-slate-400">
                      {filteredEmployees.length - index}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
                          {emp.photo ? <img src={emp.photo} className="w-full h-full object-cover" /> : <Users size={20} className="text-slate-300" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-black text-slate-800 leading-none">{emp.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[8px] font-black text-primary uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded border border-primary/10">
                              ID: {emp.custom_id}
                            </span>
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              MID: {emp.machine_id}
                            </span>
                            {emp.is_uif_registered ? (
                              <span className="text-[7px] font-black bg-emerald-50 text-emerald-600 px-1 rounded uppercase">UIF</span>
                            ) : (
                              <span className="text-[7px] font-black bg-slate-50 text-slate-400 px-1 rounded uppercase">No UIF</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${emp.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] font-bold text-slate-500 italic">
                      {emp.joined_date ? new Date(emp.joined_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-700">R{emp.salary_rate}</span>
                        <span className="text-[8px] font-black text-primary uppercase tracking-tighter">{emp.salary_type}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedEmployee(emp); setActiveModal('advance'); setFormData({ ...emp, advance_amount: 0 }); }} className="p-2 text-slate-400 hover:text-indigo-500 transition-all rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100 flex items-center gap-1">
                          <Wallet size={14} />
                          <span className="text-[10px] font-black uppercase">Advance</span>
                        </button>
                        <button onClick={() => { setSelectedEmployee(emp); setFormData({ ...emp, signature: emp.signature || null, password: '', profileImage: null }); setPreviewImage(emp.photo); setSignatureType('upload'); setActiveModal('view'); }} className="p-2 text-slate-400 hover:text-primary transition-all rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100"><Eye size={16} /></button>
                        <button onClick={() => { setSelectedEmployee(emp); setFormData({ ...emp, signature: emp.signature || null, password: '', profileImage: null }); setPreviewImage(emp.photo); setSignatureType('upload'); setActiveModal('edit'); }} className="p-2 text-slate-400 hover:text-emerald-500 transition-all rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100"><Edit2 size={16} /></button>
                        <button onClick={() => { setSelectedEmployee(emp); setActiveModal('delete'); }} className="p-2 text-slate-400 hover:text-rose-500 transition-all rounded-xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(activeModal === 'view' || activeModal === 'edit' || activeModal === 'add') && (
          <Modal title={activeModal === 'view' ? 'Personnel Profile' : activeModal === 'edit' ? 'Update Details' : 'New Registration'} onClose={() => setActiveModal(null)}>
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-2 border-slate-100 shadow-lg bg-slate-50 flex items-center justify-center">
                    {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <Users size={32} className="text-slate-200" />}
                  </div>
                  {activeModal !== 'view' && (
                    <label className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-xl shadow-md border border-slate-100 cursor-pointer hover:text-primary transition-all hover:scale-110">
                      <ImageIcon size={12} /><input type="file" className="hidden" accept=".jpg,.jpeg,.png" onChange={handlePhotoChange} />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-black text-slate-800 leading-none">{formData.name || 'Personnel Member'}</h2>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1.5">{formData.role === 'admin' ? 'System Administrator' : 'Staff Member'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  {activeModal === 'view' ? <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">{formData.name}</p> : <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" />}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portal Role</label>
                  {activeModal === 'view' ? <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold uppercase">{formData.role}</p> : (
                    <select name="role" value={formData.role} onChange={handleInputChange} className="input-field">
                      <option value="employee">Staff / Employee</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                  {activeModal === 'view' ? (
                    <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">{formData.custom_id || '---'}</p>
                  ) : (
                    <input 
                      type="text" 
                      inputMode="numeric"
                      name="custom_id" 
                      value={formData.custom_id} 
                      onChange={handleInputChange} 
                      className="input-field" 
                      placeholder="e.g. 1001" 
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Machine ID</label>
                  {activeModal === 'view' ? (
                    <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">{formData.machine_id}</p>
                  ) : (
                    <input type="text" name="machine_id" value={formData.machine_id} className="input-field bg-slate-50 cursor-not-allowed" readOnly />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  {activeModal === 'view' ? <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">{formData.email}</p> : <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" />}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  {activeModal === 'view' ? <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">{formData.phone}</p> : <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="input-field" placeholder="e.g. +27 123 456 789" />}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shift</label>
                  {activeModal === 'view' ? <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">{formData.shift}</p> : (
                    <select name="shift" value={formData.shift} onChange={handleInputChange} className="input-field">
                      <option>Morning Shift</option><option>Evening Shift</option><option>Night Shift</option>
                    </select>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary Rate (R)</label>
                  {activeModal === 'view' ? <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">{formData.salary_rate}</p> : <input type="number" name="salary_rate" value={formData.salary_rate} onChange={handleInputChange} className="input-field" />}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary Type</label>
                  {activeModal === 'view' ? <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold uppercase">{formData.salary_type}</p> : (
                    <select name="salary_type" value={formData.salary_type} onChange={handleInputChange} className="input-field">
                      <option value="hourly">Hourly</option><option value="daily">Daily</option>
                    </select>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portal Password</label>
                  {activeModal === 'view' ? <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">••••••••</p> : <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="input-field" placeholder="Leave empty for default" />}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Advance Balance (R)</label>
                  {activeModal === 'view' ? <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">R{formData.advance_balance}</p> : <input type="number" name="advance_balance" value={formData.advance_balance} onChange={handleInputChange} className="input-field" />}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UIF Number</label>
                  {activeModal === 'view' ? <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">{formData.uif_number || '---'}</p> : <input type="text" name="uif_number" value={formData.uif_number} onChange={handleInputChange} className="input-field" />}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Joining Date</label>
                  {activeModal === 'view' ? (
                    <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold">
                      {formData.joined_date ? new Date(formData.joined_date).toLocaleDateString() : '---'}
                    </p>
                  ) : (
                    <input type="date" name="joined_date" value={formData.joined_date ? formData.joined_date.split('T')[0] : ''} onChange={handleInputChange} className="input-field" />
                  )}
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mt-2 border border-slate-100">
                  <input
                    type="checkbox"
                    id="is_uif_registered"
                    name="is_uif_registered"
                    checked={formData.is_uif_registered}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_uif_registered: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-slate-300"
                  />
                  <label htmlFor="is_uif_registered" className="text-[11px] font-black text-slate-600 uppercase tracking-widest cursor-pointer">
                    UIF Registered (1% Deduction)
                  </label>
                </div>

                <div className="sm:col-span-2 space-y-2 mt-4 pt-4 border-t border-slate-50">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><PenTool size={12} /> E-Signature</label>
                  {activeModal !== 'view' ? (
                    <div className="space-y-3">
                      <div className="flex gap-2 mb-2">
                        <button onClick={() => setSignatureType('draw')} className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${signatureType === 'draw' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>Draw</button>
                        <button onClick={() => setSignatureType('upload')} className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${signatureType === 'upload' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>Upload</button>
                      </div>
                      {signatureType === 'draw' ? (
                        <>
                          <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-white overflow-hidden"><SignatureCanvas ref={sigPad} canvasProps={{ className: 'w-full h-40' }} backgroundColor="white" /></div>
                          <div className="flex gap-2"><button onClick={clearSignature} className="btn-secondary py-1 px-3 text-[9px]">Clear</button><button onClick={saveDrawnSignature} className="btn-primary py-1 px-3 text-[9px]">Save Drawn</button></div>
                        </>
                      ) : (
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <div className="w-48 h-20 bg-white rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">{formData.signature ? <img src={formData.signature} className="max-h-full object-contain" /> : <span className="text-[9px] font-black text-slate-300 uppercase">Empty</span>}</div>
                          <input type="file" id="sig-up" className="hidden" accept=".jpg,.jpeg,.png" onChange={handleSignatureUpload} /><label htmlFor="sig-up" className="btn-secondary py-2 px-4 cursor-pointer text-[10px]">Choose File</label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-48 h-20 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">{formData.signature ? <img src={formData.signature} className="max-h-full object-contain" /> : <span className="text-[9px] font-black text-slate-300 uppercase">No Signature</span>}</div>
                  )}
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 bg-white sticky bottom-0">
                <button onClick={() => setActiveModal(null)} className="btn-secondary px-6">Cancel</button>
                {activeModal !== 'view' && <button onClick={() => handleSubmit(activeModal === 'edit')} disabled={loading} className="btn-primary px-8 shadow-lg shadow-primary/20">{loading ? 'Saving...' : 'Save Profile'}</button>}
              </div>
            </div>
          </Modal>
        )}

        {activeModal === 'advance' && (
          <Modal title="Record Advance Payment" onClose={() => setActiveModal(null)} type="delete">
            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wallet size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Issue Advance</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Employee: {selectedEmployee?.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Advance Amount (R)</label>
                <input
                  type="number"
                  className="input-field text-center text-xl font-black"
                  value={formData.advance_amount}
                  onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-[9px] font-bold text-amber-600 text-center uppercase tracking-widest mt-2">
                  Current Balance: R{selectedEmployee?.advance_balance || 0}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 btn-secondary py-3">Cancel</button>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const newBalance = parseFloat(selectedEmployee.advance_balance || 0) + parseFloat(formData.advance_amount || 0);
                      await api.put(`/employees/${selectedEmployee.id}`, { ...selectedEmployee, advance_balance: newBalance });
                      await fetchEmployees();
                      setActiveModal(null);
                    } catch (err) {
                      alert('Failed to update advance');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="flex-1 btn-primary py-3 shadow-lg shadow-primary/20"
                >
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {activeModal === 'delete' && (
          <Modal title="Confirm Termination" onClose={() => setActiveModal(null)} type="delete">
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto animate-bounce"><Trash2 size={32} /></div>
              <p className="text-sm font-bold text-slate-600">Delete <span className="text-slate-900 font-black">{selectedEmployee?.name}</span>? This is permanent.</p>
              <div className="flex gap-3"><button onClick={() => setActiveModal(null)} className="flex-1 btn-secondary py-3">Cancel</button><button onClick={handleDelete} className="flex-1 bg-rose-500 text-white font-black py-3 rounded-2xl shadow-xl shadow-rose-500/20 uppercase text-[10px] tracking-widest">Confirm</button></div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const Modal = ({ title, children, onClose, type = 'default' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="modal-overlay"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className={`modal-box ${type === 'delete' ? 'modal-sm' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-xl border border-slate-100 shadow-sm">
          <X size={18} />
        </button>
      </div>
      <div className="modal-body custom-scrollbar">
        {children}
      </div>
    </motion.div>
  </motion.div>
);

export default Employees;
