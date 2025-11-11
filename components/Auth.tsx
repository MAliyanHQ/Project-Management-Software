import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Layers, ArrowRight } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate networking delay for animation
    await new Promise(r => setTimeout(r, 800));

    const success = await login(username, password);
    if (!success) {
      setError('Invalid credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-slate-900 text-white font-sans selection:bg-brand-500/30">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-600/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
         <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-emerald-500/20 rounded-full blur-[80px] animate-bounce duration-[5000ms]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
            <div className="flex flex-col items-center mb-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border border-white/10">
                    <Layers size={40} className="text-brand-400" />
                </div>
              </div>
              <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Task Flow</h1>
              <p className="text-sm text-slate-400 mt-2 tracking-widest uppercase text-[10px] font-semibold">by M. Aliyan H. Qureshi</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded-lg text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">USERNAME</label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all hover:bg-black/30"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">PASSWORD</label>
                <input 
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all hover:bg-black/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-brand-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-slate-500">
              
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};