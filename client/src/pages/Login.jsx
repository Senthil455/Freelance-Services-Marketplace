import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser } from '../store/slices/authSlice.js';
import Spinner from '../components/Spinner.jsx';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="card p-7">
        <h1 className="text-2xl font-extrabold text-gray-900">Sign in</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back to SkillForge.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5">
            {loading ? <Spinner size={16} className="text-white" /> : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          New to SkillForge? <Link to="/register" className="font-semibold text-brand-600">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
