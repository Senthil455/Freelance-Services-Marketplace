import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Camera, Plus, Trash2, Save, KeyRound, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import { updateProfile, changePassword, logoutUser } from '../../store/slices/authSlice.js';
import { useAppDispatch } from '../../hooks/useAppDispatch.js';
import Avatar from '../../components/Avatar.jsx';
import Spinner from '../../components/Spinner.jsx';
import { Modal } from '../GigDetail.jsx';

const LANG_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native'];

export default function DashboardSettings() {
  const dispatch = useAppDispatch();
  const { user } = useSelector((s) => s.auth);
  const avatarInput = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    tagline: user?.tagline || '',
    bio: user?.bio || '',
    location: user?.location || '',
    skills: user?.skills || [],
    languages: user?.languages || [],
    education: user?.education || [],
    employment: user?.employment || [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const body = new FormData();
      body.append('name', form.name.trim());
      body.append('tagline', form.tagline);
      body.append('bio', form.bio);
      body.append('location', form.location);
      body.append('skills', JSON.stringify(form.skills));
      body.append('languages', JSON.stringify(form.languages));
      body.append('education', JSON.stringify(form.education));
      body.append('employment', JSON.stringify(form.employment));
      if (avatar) body.append('avatar', avatar);
      const { data } = await api.put('/users/profile', body);
      dispatch({ type: 'auth/setUser', payload: data.user });
      setAvatar(null);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (form.skills.includes(s)) return setSkillInput('');
    if (form.skills.length >= 20) return toast.info('Maximum 20 skills');
    set('skills', [...form.skills, s]);
    setSkillInput('');
  };

  const changePass = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (passForm.newPassword !== passForm.confirm) return toast.error('Passwords do not match');
    setPassLoading(true);
    try {
      await dispatch(changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })).unwrap?.();
      toast.success('Password changed');
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteEmail.trim().toLowerCase() !== user?.email) return toast.error('Email does not match your account');
    setDeleteLoading(true);
    try {
      await api.delete('/users/account', { data: { email: deleteEmail } });
      dispatch(logoutUser());
      toast.success('Account deleted');
      window.location.href = '/';
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="h2 text-gray-900">Settings</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="card p-6">
            <h2 className="text-base font-bold text-gray-900">Profile</h2>
            <div className="mt-5 flex items-center gap-5">
              <div className="relative">
                <Avatar user={{ ...user, avatar: avatar ? URL.createObjectURL(avatar) : user?.avatar }} size={72} />
                <button type="button" onClick={() => avatarInput.current?.click()} className="absolute -bottom-1 -right-1 rounded-full bg-brand-600 p-2 text-white shadow transition hover:bg-brand-700" aria-label="Upload avatar">
                  <Camera size={13} />
                </button>
              </div>
              <input ref={avatarInput} type="file" accept="image/*" hidden onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
              <div>
                <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                {avatar && <button type="button" onClick={() => setAvatar(null)} className="mt-1 text-xs font-semibold text-rose-600 hover:underline">Remove new photo</button>}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Location</label>
                <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. United States" className="input" />
              </div>
            </div>

            <label className="label mt-4">Tagline</label>
            <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="What do you do in one line?" maxLength={100} className="input" />

            <label className="label mt-4">Bio</label>
            <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={5} maxLength={3000} placeholder="Tell clients about your experience…" className="input resize-none" />
          </div>

          <div className="card p-6">
            <h2 className="text-base font-bold text-gray-900">Skills</h2>
            <div className="mt-4 flex gap-2">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="Add a skill and press Enter" className="input" />
              <button type="button" onClick={addSkill} className="btn-secondary shrink-0"><Plus size={16} /></button>
            </div>
            {form.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                    {s}
                    <button type="button" onClick={() => set('skills', form.skills.filter((x) => x !== s))} className="text-brand-400 hover:text-rose-500"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-base font-bold text-gray-900">Languages</h2>
            <div className="mt-4 space-y-2.5">
              {form.languages.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input value={l.name} onChange={(e) => set('languages', form.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Language" className="input" />
                  <select value={l.level} onChange={(e) => set('languages', form.languages.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)))} className="input w-44">
                    {LANG_LEVELS.map((lv) => <option key={lv}>{lv}</option>)}
                  </select>
                  <button type="button" onClick={() => set('languages', form.languages.filter((_, j) => j !== i))} className="btn-secondary shrink-0 !px-3" aria-label="Remove language"><Trash2 size={15} /></button>
                </div>
              ))}
              <button type="button" onClick={() => set('languages', [...form.languages, { name: '', level: 'Fluent' }])} className="btn-ghost !text-brand-600">
                <Plus size={15} /> Add language
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-bold text-gray-900">Education</h2>
            <div className="mt-4 space-y-3">
              {form.education.map((ed, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={ed.school} onChange={(e) => set('education', form.education.map((x, j) => (j === i ? { ...x, school: e.target.value } : x)))} placeholder="School / university" className="input" />
                    <input value={ed.degree} onChange={(e) => set('education', form.education.map((x, j) => (j === i ? { ...x, degree: e.target.value } : x)))} placeholder="Degree" className="input" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <input value={ed.field} onChange={(e) => set('education', form.education.map((x, j) => (j === i ? { ...x, field: e.target.value } : x)))} placeholder="Field of study" className="input" />
                    <input type="number" value={ed.startYear || ''} onChange={(e) => set('education', form.education.map((x, j) => (j === i ? { ...x, startYear: Number(e.target.value) } : x)))} placeholder="Start year" className="input" />
                    <input type="number" value={ed.endYear || ''} onChange={(e) => set('education', form.education.map((x, j) => (j === i ? { ...x, endYear: Number(e.target.value) || null } : x)))} placeholder="End year (leave empty)" className="input" />
                  </div>
                  <button type="button" onClick={() => set('education', form.education.filter((_, j) => j !== i))} className="btn-ghost mt-2 !px-2 !text-rose-600">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => set('education', [...form.education, { school: '', degree: '', field: '', startYear: null, endYear: null }])} className="btn-ghost !text-brand-600">
                <Plus size={15} /> Add education
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-bold text-gray-900">Employment</h2>
            <div className="mt-4 space-y-3">
              {form.employment.map((j, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={j.company} onChange={(e) => set('employment', form.employment.map((x, idx) => (idx === i ? { ...x, company: e.target.value } : x)))} placeholder="Company" className="input" />
                    <input value={j.title} onChange={(e) => set('employment', form.employment.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))} placeholder="Job title" className="input" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <input value={j.startDate} onChange={(e) => set('employment', form.employment.map((x, idx) => (idx === i ? { ...x, startDate: e.target.value } : x)))} placeholder="Start (MM/YYYY)" className="input" />
                    <input value={j.endDate} onChange={(e) => set('employment', form.employment.map((x, idx) => (idx === i ? { ...x, endDate: e.target.value } : x)))} placeholder="End (MM/YYYY, empty = present)" className="input" />
                  </div>
                  <textarea value={j.description} onChange={(e) => set('employment', form.employment.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))} rows={2} placeholder="Short description of your role" className="input mt-3 resize-none" />
                  <button type="button" onClick={() => set('employment', form.employment.filter((_, idx) => idx !== i))} className="btn-ghost mt-2 !px-2 !text-rose-600">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => set('employment', [...form.employment, { company: '', title: '', description: '', startDate: '', endDate: '' }])} className="btn-ghost !text-brand-600">
                <Plus size={15} /> Add employment
              </button>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner size={17} className="text-white" /> : <Save size={16} />} Save changes
          </button>
        </form>

        <div className="space-y-6">
          <form onSubmit={changePass} className="card p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><KeyRound size={17} className="text-brand-600" /> Change password</h2>
            <label className="label mt-4">Current password</label>
            <input type="password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} className="input" />
            <label className="label mt-3">New password</label>
            <input type="password" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} className="input" />
            <label className="label mt-3">Confirm new password</label>
            <input type="password" value={passForm.confirm} onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })} className="input" />
            <button type="submit" disabled={passLoading} className="btn-primary mt-4 w-full">
              {passLoading ? <Spinner size={16} className="text-white" /> : 'Update password'}
            </button>
          </form>

          <div className="card border-red-200 p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-red-700"><AlertTriangle size={17} /> Danger zone</h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Deleting your account permanently removes your profile, gigs and data. Active orders must be completed or cancelled first.
            </p>
            <button onClick={() => setDeleteOpen(true)} className="mt-4 w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50">
              Delete my account
            </button>
          </div>
        </div>
      </div>

      {deleteOpen && (
        <Modal title="Delete account" onClose={() => setDeleteOpen(false)}>
          <p className="text-sm text-gray-500">
            This action is permanent. Type <span className="font-bold text-gray-800">{user?.email}</span> to confirm.
          </p>
          <input value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)} placeholder="you@example.com" className="input mt-4" />
          <button onClick={deleteAccount} disabled={deleteLoading} className="mt-4 w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60">
            {deleteLoading ? <Spinner size={16} className="text-white" /> : 'Permanently delete account'}
          </button>
        </Modal>
      )}
    </div>
  );
}