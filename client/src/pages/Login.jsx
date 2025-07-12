import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { loginUser } from '../store/slices/authSlice.js';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import Spinner from '../components/Spinner.jsx';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate(user.role === 'admin' ? '/admin' : location.state?.from || '/', { replace: true });
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const { payload } = await dispatch(loginUser({ email, password }));
      if (!payload) throw new Error('Invalid credentials');
      toast.success(`Welcome back, ${payload.name.split(' ')[0]}!`);
      navigate(payload.role === 'admin' ? '/admin' : location.state?.from || '/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
            <Sparkles size={13} /> Welcome back
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">Sign in to SkillForge</h1>
          <p className="mt-2 text-sm text-gray-500">Access your orders, messages and seller dashboard.</p>
        </div>

        <form onSubmit={submit} className="card p-7">
          <label className="label">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input !pl-10" autoFocus />
          </div>

          <label className="label mt-4">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input !pl-10" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full !py-3">
            {loading ? <Spinner size={17} className="text-white" /> : 'Sign in'}
          </button>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create one</Link>
          </p>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck size={14} className="text-emerald-500" /> Secure login · Your data stays private
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-xs text-gray-500">
          <p><span className="font-bold text-gray-700">Demo accounts:</span> admin@demo.com / admin12345 · buyer@demo.com / password123 · aarav@demo.com / password123</p>
        </div>
      </div>
    </div>
  );
}