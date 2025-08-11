import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Camera, KeyRound, Save, AlertTriangle } from 'lucide-react';
import api from '../api/client';
import { Avatar } from '../../components/Avatar.jsx';
import { Modal } from '../../GigDetail.jsx';

const LANG_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Native'];

export default function Settings() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const [form, setForm] = useState({});
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      title: user.title || '',
      hourlyRate: user.hourlyRate || '',
      country: user.country || '',
    });
    setSkills(user.skills || []);
    setLanguages(user.languages || []);
  }, [user]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="card flex items-center gap-4">
        <Avatar user={user} size="lg" />
        <div>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <label className="btn btn-outline ml-auto cursor-pointer">
          <Camera className="h-4 w-4" /> Change
          <input type="file" accept="image/*" hidden className="hidden" />
        </label>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="label">Name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Professional title</label>
          <input value={form.title} onChange={(e) => update('title', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} rows={4} className="input resize-none" />
        </div>
      </div>
      <div className="card">
        <h2 className="font-medium mb-3">Password</h2>
        <button onClick={() => setEditPassword(true)} className="btn btn-outline">
          <KeyRound className="h-4 w-4" /> Change password
        </button>
      </div>
      <div className="card border-red-200">
        <h2 className="font-medium text-red-600 mb-3">Delete account</h2>
        <button onClick={() => setDeleteModal(true)} className="btn btn-outline text-red-600">
          <AlertTriangle className="h-4 w-4" /> Delete my account
        </button>
      </div>
    </div>
  );
}
