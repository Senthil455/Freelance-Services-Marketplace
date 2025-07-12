import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Store, ShoppingBag, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { registerUser } from '../store/slices/authSlice.js';
import { useAppDispatch } from '../hooks/useAppDispatch.js';
import Spinner from '../components/Spinner.jsx';

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill in all fields');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { payload } = await dispatch(registerUser({ name, email, password, role }));
      if (!payload) throw new Error('Registration failed');
      toast.success('Account created — welcome to SkillForge!');
      navigate(payload.role === 'seller' ? '/dashboard/gigs/new' : '/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
            <Sparkles size={13} /> Join the marketplace
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500">Buy services or start selling yours — it's free to join.</p>
        </div>

        <form onSubmit={submit} className="card p-7">
          <label className="label">Full name</label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="input !pl-10" autoFocus />
          </div>

          <label className="label mt-4">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input !pl-10" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 chars" className="input !pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Confirm</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat it" className="input !pl-10" />
              </div>
            </div>
          </div>

          <label className="label mt-4">I am joining as</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'buyer', label: 'Buyer', desc: 'I want to hire', icon: ShoppingBag },
              { value: 'seller', label: 'Seller', desc: 'I want to sell', icon: Store },
            ].map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setRole(opt.value)}
                className={`rounded-xl border-2 p-3.5 text-left transition ${role === opt.value ? 'border-brand-600 bg-brand-50/40' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <opt.icon size={17} className={role === opt.value ? 'text-brand-600' : 'text-gray-400'} />
                <p className="mt-1.5 text-sm font-bold text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </button>
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full !py-3">
            {loading ? <Spinner size={17} className="text-white" /> : 'Create account'}
          </button>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}