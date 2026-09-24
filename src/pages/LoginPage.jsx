import { useState, useRef } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Package2,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const submitLockRef = useRef(false);

  // If already authenticated, redirect immediately
  if (isAuthenticated) {
    return <Navigate to="/products" replace />;
  }

  const from = location.state?.from?.pathname || '/products';

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple rapid clicks
    if (isLoading || submitLockRef.current) return;

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    submitLockRef.current = true;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await login(username, password);
      showToast(
        `Welcome back, ${result.user.firstName || result.user.username}!`,
        'success'
      );
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.userMessage ||
          'Invalid credentials. Please verify your username and password.'
      );
    } finally {
      setIsLoading(false);
      submitLockRef.current = false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/25 mb-4 transform hover:scale-105 transition-transform">
            <Package2 className="w-7 h-7" />
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            NexStore Admin
          </h2>
          <p className="mt-1 text-center text-sm text-slate-500">
            Sign in to access your inventory and product catalog
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80">
          {/* Quick Demo Credentials Assistant */}
          <div className="mb-6 p-3.5 bg-indigo-50/70 border border-indigo-200/70 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Demo Credentials:</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickFill('emilys', 'emilyspass')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline focus:outline-none"
              >
                Auto-fill
              </button>
            </div>
            <div className="mt-1.5 text-xs text-indigo-700/90 font-mono flex items-center gap-2">
              <span>user: <strong className="text-indigo-900 font-semibold">emilys</strong></span>
              <span>•</span>
              <span>pass: <strong className="text-indigo-900 font-semibold">emilyspass</strong></span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5 text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium text-xs sm:text-sm">{errorMessage}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. emilys"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-indigo-600/25 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Test wrong credentials quick button to demonstrate requirement */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={() => handleQuickFill('emilys', 'wrongpassword')}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Test with invalid password
            </button>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured via DummyJSON Auth API (JWT Token Bearer)</span>
        </div>
      </div>
    </div>
  );
}
