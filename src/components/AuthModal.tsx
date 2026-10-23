import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LogIn,
  UserPlus
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/hotel';
import { DEMO_USERS } from '../data/seedData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'register' | 'reset'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');

    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (matched) {
      onSelectUser(matched);
      setMessage(`Welcome back, ${matched.fullName}!`);
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      // Allow custom email login as guest
      const newGuestUser: UserProfile = {
        id: `user-guest-${Date.now()}`,
        email: email.trim(),
        fullName: fullName || email.split('@')[0],
        role: 'guest',
        createdAt: new Date().toISOString(),
      };
      onSelectUser(newGuestUser);
      setMessage(`Logged in as Guest (${email})`);
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    // Security constraint: Do not allow self-assigned administrator privileges
    const newGuestUser: UserProfile = {
      id: `user-guest-${Date.now()}`,
      email: email.trim(),
      fullName: fullName.trim() || 'New Guest',
      role: 'guest', // Always guest by default for self-registration
      createdAt: new Date().toISOString(),
    };
    onSelectUser(newGuestUser);
    setMessage(`Account created successfully! Welcome, ${newGuestUser.fullName}.`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your account email.');
      return;
    }
    setMessage(`A secure password reset link has been dispatched to ${email}. Check your inbox.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold font-display">Authentication & Role Switcher</h2>
              <p className="text-xs text-slate-300">HotelPro Role-Based Access Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
          <button
            onClick={() => {
              setActiveTab('demo');
              setErrorMessage('');
              setMessage('');
            }}
            className={`flex-1 py-3 px-3 text-center transition-colors cursor-pointer ${
              activeTab === 'demo'
                ? 'bg-white text-slate-900 border-b-2 border-slate-900 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Instant Role Switcher
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setMessage('');
            }}
            className={`flex-1 py-3 px-3 text-center transition-colors cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 border-b-2 border-slate-900 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setMessage('');
            }}
            className={`flex-1 py-3 px-3 text-center transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 border-b-2 border-slate-900 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          {activeTab === 'demo' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Switch instantly between verified system personas to test role-specific dashboards, permissions, front-desk actions, and guest booking records:
              </p>

              <div className="space-y-2.5">
                {DEMO_USERS.map((user) => {
                  const isCurrent = currentUser.id === user.id;

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        setMessage(`Switched active session to ${user.fullName} (${user.role.toUpperCase()})`);
                        setTimeout(() => {
                          onClose();
                        }, 500);
                      }}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-slate-900 bg-slate-900/5 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                            user.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : user.role === 'receptionist'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : user.role === 'staff'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {user.role[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>{user.fullName}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="uppercase text-[10px] font-mono tracking-wider font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {user.role}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                Current active identity: <span className="font-semibold text-slate-800">{currentUser.fullName} ({currentUser.role})</span>
              </div>
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hotelpro.com"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reset')}
                    className="text-[11px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Sign In
              </button>

              <div className="text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-slate-900 font-semibold underline cursor-pointer"
                >
                  Register as Guest
                </button>
              </div>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Eleanor Vance"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guest@example.com"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
                Self-registered accounts automatically receive Guest privileges. Administrative and staff access must be provisioned by an existing system administrator.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Create Guest Account
              </button>
            </form>
          )}

          {activeTab === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                Enter your registered email address and we'll send a password recovery token.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@hotelpro.com"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Send Password Reset Email
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-full text-center text-xs text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                Return to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
