import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { registerUser } from '../store/slices/authSlice.js';
import Spinner from '../components/Spinner.jsx';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(registerUser(form)).unwrap();
      toast.success('Account created');
      navigate(form.role === 'seller' ? '/dashboard/gigs/new' : '/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="card p-7">
        <h1 className="text-2xl font-extrabold text-gray-900">Create an account</h1>
        <p className="mt-1 text-sm text-gray-500">Join SkillForge to hire or offer services.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <RoleButton label="Buyer" desc="Hire freelancers" active={form.role === 'buyer'} onClick={() => setForm({ ...form, role: 'buyer' })} />
            <RoleButton label="Seller" desc="Offer services" active={form.role === 'seller'} onClick={() => setForm({ ...form, role: 'seller' })} />
          </div>
          <div>
            <label className="label">Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" className="input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5">
            {loading ? <Spinner size={16} className="text-white" /> : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function RoleButton({ label, desc, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-lg border p-3 text-left transition ${
      active ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <span className="block text-sm font-bold text-gray-800">{label}</span>
      <span className="block text-xs text-gray-500">{desc}</span>
    </button>
  );
}
