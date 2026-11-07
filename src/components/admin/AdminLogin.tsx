import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { adminApi, AdminUser } from '../../services/adminApi';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onReturnToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onReturnToSite,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await adminApi.login(identifier, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F1E9DC] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-editorial-sans text-[#292723]">
      {/* Top Bar with Return to Public Site */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <button
          onClick={onReturnToSite}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#70452D] hover:text-[#873A35] transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>Return to Café Website</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#70452D] uppercase">
          <ShieldCheck size={14} className="text-[#873A35]" />
          <span>Restricted Access</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-[#FFF3DF] border border-[#DCCBB4] rounded-xs p-7 sm:p-9 shadow-xl relative overflow-hidden animate-fade-in">
          
          {/* Subtle Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#873A35]" />

          {/* Brand Header */}
          <div className="text-center space-y-2 mb-7">
            <div className="flex items-center justify-center gap-2 tracking-[0.2em] font-editorial-sans text-[#292723]">
              <span className="text-2xl font-bold uppercase tracking-[0.18em]">MRDĀ</span>
              <span className="text-sm text-[#873A35]">✦</span>
            </div>
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#873A35] font-semibold">
              HOSPITALITY CONSOLE
            </div>
            <p className="text-xs text-[#70452D] font-light max-w-xs mx-auto leading-relaxed pt-1">
              Sign in with your authorized administrator credentials to manage reservations, menu, and events.
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50/80 border border-red-200/80 rounded-xs flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
              <AlertCircle size={16} className="text-[#873A35] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#70452D] mb-1.5 flex items-center justify-between">
                <span>Email or Username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="admin@atmrda.com or admin"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs font-sans bg-white border border-[#DCCBB4] rounded-xs pl-9 pr-3 py-2.5 text-[#292723] focus:outline-hidden focus:border-[#873A35] focus:ring-1 focus:ring-[#873A35] placeholder:text-[#70452D]/40"
                />
                <User size={15} className="absolute left-3 top-3 text-[#70452D]/60 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#70452D] mb-1.5 flex items-center justify-between">
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-[#DCCBB4] rounded-xs pl-9 pr-10 py-2.5 text-[#292723] focus:outline-hidden focus:border-[#873A35] focus:ring-1 focus:ring-[#873A35] placeholder:text-[#70452D]/40"
                />
                <Lock size={15} className="absolute left-3 top-3 text-[#70452D]/60 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 p-1 text-[#70452D]/70 hover:text-[#292723] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#873A35] hover:bg-[#70452D] disabled:opacity-60 text-[#FFF3DF] text-xs font-semibold tracking-[0.18em] uppercase py-3 rounded-full transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <span>Sign In to Console</span>
                )}
              </button>
            </div>
          </form>

          {/* Secure access notice (no plaintext credentials exposed in UI) */}
          <div className="mt-6 pt-5 border-t border-[#DCCBB4]/60 text-[11px] font-mono text-[#70452D]/85 leading-relaxed bg-[#F1E9DC]/60 p-3 rounded-xs border">
            <span className="font-semibold text-[#873A35] block mb-0.5">AUTHORIZED ACCESS ONLY:</span>
            <span>Sign in with your authorized administrator username or email.</span>
            <span className="block mt-1 text-[10px] text-[#70452D]/70">Passwords are salted and scrypt-hashed on server. Credentials can be modified under Console Settings.</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-[11px] font-mono text-[#70452D]/70">
        <span>MRDĀ Café · The Claywalls, Thaltej, Ahmedabad · Administrative Operations</span>
      </footer>
    </div>
  );
};
