import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Eye, EyeOff, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/axios';

import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    userId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/login', {
        userId: credentials.userId,
        password: credentials.password
      });
      
      const { token, user } = response.data;
      login(user, token);
      
      // Use actual role from DB — not the UI toggle
      const dbRole = user.role?.toLowerCase();
      if (dbRole === 'admin' || dbRole === 'master admin' || dbRole === 'hr') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side - Illustration/Brand */}
        <div className="md:w-1/2 bg-primary p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Fingerprint size={32} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">BioTrack Pro</h1>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">
              Modern Biometric <br /> 
              <span className="text-secondary-light">Attendance System</span>
            </h2>
            <p className="text-primary-light text-lg max-w-sm">
              Seamlessly manage your workforce with AI-powered face and fingerprint recognition.
            </p>
          </div>

          <div className="mt-12 relative z-10">
            <div className="flex -space-x-3 mb-4">
              {[
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80"
              ].map((url, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-slate-200 overflow-hidden">
                  <img src={url} alt="user" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary-dark flex items-center justify-center text-xs font-bold">
                +12k
              </div>
            </div>
            <p className="text-sm text-primary-light">Trusted by 500+ companies worldwide</p>
          </div>

          {/* Abstract Shapes */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-secondary/20 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white">
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h3>
            <p className="text-slate-500">Enter your credentials to access your dashboard</p>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl"
              >
                {error}
              </motion.div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email / User ID</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Email" 
                  className="input-field pl-12"
                  value={credentials.userId}
                  onChange={(e) => setCredentials({...credentials, userId: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  className="input-field pl-12"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="rounded border-slate-300 text-primary focus:ring-primary" />
                <label htmlFor="remember" className="text-sm text-slate-600">Remember me</label>
              </div>
              <a href="#" className="text-sm font-semibold text-primary hover:text-primary-dark">Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
