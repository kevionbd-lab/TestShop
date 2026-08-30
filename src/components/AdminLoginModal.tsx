import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ShieldAlert, ArrowLeft } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, email: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success && data.token) {
        localStorage.setItem('testshop_admin_token', data.token);
        localStorage.setItem('testshop_admin_email', data.email);
        onLoginSuccess(data.token, data.email);
        onClose();
      } else {
        // Fallback for offline / direct local check
        if (
          (email.trim().toLowerCase() === 'admin@testshop.com' || email.trim().toLowerCase() === 'sh9145080@gmail.com') &&
          password.trim() === 'admin123456'
        ) {
          const fakeToken = 'admin_session_' + Date.now();
          localStorage.setItem('testshop_admin_token', fakeToken);
          localStorage.setItem('testshop_admin_email', email);
          onLoginSuccess(fakeToken, email);
          onClose();
        } else {
          setError(data.error || 'ভুল ইমেইল অথবা পাসওয়ার্ড দিয়েছেন!');
        }
      }
    } catch {
      // Local fallback check
      if (
        (email.trim().toLowerCase() === 'admin@testshop.com' || email.trim().toLowerCase() === 'sh9145080@gmail.com') &&
        password.trim() === 'admin123456'
      ) {
        const fakeToken = 'admin_session_' + Date.now();
        localStorage.setItem('testshop_admin_token', fakeToken);
        localStorage.setItem('testshop_admin_email', email);
        onLoginSuccess(fakeToken, email);
        onClose();
      } else {
        setError('ভুল ইমেইল অথবা পাসওয়ার্ড দিয়েছেন!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Lock className="w-5 h-5" />
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
            >
              ✕
            </button>
          </div>
          <h2 className="text-xl font-bold">Admin Portal Access</h2>
          <p className="text-xs text-neutral-400 mt-1">
            শুধুমাত্র প্রজেক্ট ওনার ও অ্যাডমিনদের জন্য সুরক্ষিত লগইন।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">অ্যাডমিন ইমেইল (Admin Email)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@testshop.com বা আপনার ইমেইল"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">পাসওয়ার্ড (Password)</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-600 space-y-1">
            <p className="font-semibold text-neutral-800">🔑 ডিফল্ট ক্রেডেনশিয়াল (Default Credentials):</p>
            <p>• Email: <span className="font-mono text-neutral-900">sh9145080@gmail.com</span> অথবা <span className="font-mono text-neutral-900">admin@testshop.com</span></p>
            <p>• Password: <span className="font-mono text-neutral-900 font-bold">admin123456</span></p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'যাচাই হচ্ছে...' : 'লগইন করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
