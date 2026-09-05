import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="bg-[#1E2D40] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-[#0ED7A8]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">BongoDemy Portal</h1>
          <p className="text-slate-400 text-sm text-center">Sign in to your client or admin account.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-rose-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] mt-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
