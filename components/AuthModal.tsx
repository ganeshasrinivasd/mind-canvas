'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export default function AuthModal({ isOpen, onClose, mode, onToggleMode }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold text-white mb-2">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-gray-400 mb-6">
          {mode === 'signin'
            ? 'Sign in to access your saved mind maps'
            : 'Sign up to save and sync your mind maps'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(196, 167, 125, 0.6)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196, 167, 125, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgb(55, 65, 81)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(196, 167, 125, 0.6)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196, 167, 125, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgb(55, 65, 81)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform"
            style={{
              backgroundImage: 'linear-gradient(135deg, rgba(196, 167, 125, 1) 0%, rgba(160, 139, 111, 1) 50%, rgba(139, 115, 85, 1) 100%)',
              boxShadow: '0 4px 12px rgba(196, 167, 125, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(196, 167, 125, 0.5)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 167, 125, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <button
            onClick={onToggleMode}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {mode === 'signin' ? (
              <>
                Don't have an account? <span style={{ color: '#C4A77D' }} className="font-semibold">Sign up</span>
              </>
            ) : (
              <>
                Already have an account? <span style={{ color: '#C4A77D' }} className="font-semibold">Sign in</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
