import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Briefcase, 
  Camera,
  MapPin,
  Lock,
  CheckCircle2,
  UploadCloud
} from 'lucide-react';
import api from '../../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';

const Profile = ({ type = 'admin' }) => {
  const { updateUser } = useAuth();
  const [userData, setUserData] = useState({
    name: 'Loading...',
    role: 'Staff',
    email: '',
    location: 'Main Office',
    photo: ''
  });
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const user = response.data;
      setUserData({
        name: user.name || 'User',
        role: user.role || (type === 'admin' ? 'Administrator' : 'Employee'),
        email: user.email || '',
        location: user.location || 'Main Office',
        photo: user.photo || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.put('/profile', {
        name: userData.name,
        role: userData.role,
        email: userData.email,
        location: userData.location,
        photo: userData.photo
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Update global user state
      updateUser({ 
        name: userData.name, 
        role: userData.role,
        email: userData.email,
        photo: userData.photo 
      });
      
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!password) return alert('Please enter a new password');
    try {
      setIsSaving(true);
      await api.put('/profile', { password });
      alert('Password updated successfully');
      setPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
      alert('Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Quick Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="card text-center p-8 bg-white border border-slate-100 shadow-xl rounded-[2rem]">
            <div className="relative inline-block mb-6 group">
              <div className="w-32 h-32 rounded-full border-4 border-primary/10 p-1 transition-all group-hover:border-primary/30">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 border-2 border-white shadow-inner flex items-center justify-center">
                  {userData.photo ? (
                    <img src={userData.photo} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-slate-300" />
                  )}
                </div>
              </div>
              <label className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-all border-2 border-white">
                <Camera size={14} />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <UploadCloud size={24} className="text-white" />
              </div>
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{userData.name}</h2>
            <div className="mt-2 inline-block px-4 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
              {userData.role}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                <Mail size={14} className="text-slate-300" /> {userData.email}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                <MapPin size={14} className="text-slate-300" /> {userData.location}
              </div>
            </div>
          </div>
          
          <div className="card p-6 bg-slate-900 text-white rounded-[2rem] border-none shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Account Security</h3>
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="New Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-primary outline-none" 
              />
              <button 
                onClick={handlePasswordUpdate}
                disabled={isSaving}
                className="w-full bg-primary py-2.5 rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Edit Details */}
        <div className="md:col-span-2">
          <div className="card p-8 bg-white border border-slate-100 shadow-xl rounded-[2rem]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">System Settings</h3>
              <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2 text-success text-xs font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100"
                  >
                    <CheckCircle2 size={16} /> Update Successful
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="text" 
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="text" 
                    name="role"
                    value={userData.role}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="email" 
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Office Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="text" 
                    name="location"
                    value={userData.location}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isSaving ? 'Processing Update...' : 'Confirm Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
