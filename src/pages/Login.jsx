import React, { useState } from 'react';
import { useMockData } from '../context/MockDataContext';

export default function Login() {
  const { employees, setEmployees, loginUser, addActivityLog } = useMockData();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const switchMode = () => {
    setIsSignup((prev) => !prev);
    setStatusMessage({ type: '', text: '' });
    resetForm();
  };

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleLogin = (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all fields.',
      });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    const userMatch = employees.find(
      (emp) => emp.email.toLowerCase() === cleanEmail
    );

    if (!userMatch) {
      setStatusMessage({
        type: 'error',
        text: 'Account not found. Verify email or sign up first.',
      });
      return;
    }

    if (userMatch.status && userMatch.status !== 'Active') {
      setStatusMessage({
        type: 'error',
        text: 'This account is inactive. Please contact an admin.',
      });
      return;
    }

    const result = loginUser(userMatch.email, userMatch.role);

    if (result?.ok) {
      setStatusMessage({
        type: 'success',
        text: `Signed in successfully as ${userMatch.role}.`,
      });
      setPassword('');
    } else {
      setStatusMessage({
        type: 'error',
        text: result?.message || 'Unable to sign in.',
      });
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      setStatusMessage({
        type: 'error',
        text: 'All fields are required.',
      });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    if (cleanName.length < 3) {
      setStatusMessage({
        type: 'error',
        text: 'Full name must be at least 3 characters long.',
      });
      return;
    }

    if (cleanPassword.length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const emailExists = employees.some(
      (emp) => emp.email.toLowerCase() === cleanEmail
    );

    if (emailExists) {
      setStatusMessage({
        type: 'error',
        text: 'This email address is already registered.',
      });
      return;
    }

    const newEmployeeAccount = {
      id: Date.now(),
      name: cleanName,
      email: cleanEmail,
      departmentId: 101,
      role: 'Employee',
      status: 'Active',
    };

    setEmployees((prev) => [...prev, newEmployeeAccount]);
    addActivityLog(`Created employee account for ${cleanName}`, cleanName);

    setStatusMessage({
      type: 'success',
      text: 'Account created as Employee. Please sign in.',
    });

    setName('');
    setEmail(cleanEmail);
    setPassword('');
    setIsSignup(false);
  };

  const handleForgotPassword = () => {
    setStatusMessage({ type: '', text: '' });

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your email address first.',
      });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    const userMatch = employees.find(
      (emp) => emp.email.toLowerCase() === cleanEmail
    );

    if (!userMatch) {
      setStatusMessage({
        type: 'error',
        text: 'No account exists for this email address.',
      });
      return;
    }

    setStatusMessage({
      type: 'success',
      text: `Password reset link sent to ${cleanEmail}.`,
    });
  };

  const handleDemoLogin = (role) => {
    setStatusMessage({ type: '', text: '' });

    const demoUser = employees.find(
      (emp) => emp.role === role && (!emp.status || emp.status === 'Active')
    );

    if (!demoUser) {
      setStatusMessage({
        type: 'error',
        text: `No active demo ${role.toLowerCase()} account found in mock data.`,
      });
      return;
    }

    const result = loginUser(demoUser.email, demoUser.role);

    if (result?.ok) {
      setEmail(demoUser.email);
      setPassword('');
      setStatusMessage({
        type: 'success',
        text: `Demo ${demoUser.role} login successful.`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result?.message || 'Demo login failed.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hero-dark hidden p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/60">
              Enterprise Asset ERP
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight text-white">
              AssetFlow
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Centralize asset tracking, allocations, shared resource bookings,
              maintenance workflows, and operational visibility in one responsive platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Workflow
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Allocation + booking + maintenance
              </p>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Access
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Role-based employee onboarding
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8 lg:p-10">
          <div className="mb-8 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Secure workspace access
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              {isSignup ? 'Create employee account' : 'Sign in to AssetFlow'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isSignup
                ? 'Register a standard employee profile. Elevated roles are assigned only by admins.'
                : 'Access your role-managed asset operations dashboard.'}
            </p>
          </div>

          {statusMessage.text && (
            <div
              className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium ${
                statusMessage.type === 'error'
                  ? 'border border-rose-200 bg-rose-50 text-rose-700'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {!isSignup && (
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('Admin')}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Use Demo Admin Account
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('Employee')}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Use Demo Employee Account
              </button>
            </div>
          )}

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="soft-input w-full rounded-2xl px-4 py-3 text-sm"
                  placeholder="Enter full name"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="soft-input w-full rounded-2xl px-4 py-3 text-sm"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="soft-input w-full rounded-2xl px-4 py-3 text-sm"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              {isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          {!isSignup && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="mt-4 w-full text-sm font-medium text-indigo-600 transition hover:text-indigo-800 hover:underline"
            >
              Forgot password?
            </button>
          )}

          <div className="mt-6 text-center text-sm text-slate-500">
            {isSignup ? 'Already have an account?' : 'Need a new account?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-indigo-600 hover:underline"
            >
              {isSignup ? 'Sign in here' : 'Create one'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}