import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Star, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import { Modal } from '../GigDetail.jsx';

const EMPTY = { name: '', slug: '', icon: 'code', description: '', popular: false, subCategories: [] };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [subInput, setSubInput] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openModal = (cat = null) => {
    setEditing(cat ? { ...cat } : { ...EMPTY });
    setSubInput('');
  };

  const save = async () => {
    if (!editing.name.trim() || !editing.slug.trim()) return toast.error('Name and slug are required');
    setBusy(true);
    try {
      if (editing._id) {
        await api.put(`/categories/${editing._id}`, editing);
        toast.success('Category updated');
      } else {
        await api.post('/categories', editing);
        toast.success('Category created');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (cat) => {
    setBusy(true);
    try {
      await api.delete(`/categories/${cat._id}`);
      toast.success('Category deleted');
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h2 text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">{categories.length} categories power the marketplace navigation</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary"><Plus size={16} /> New category</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c._id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-bold text-gray-900">{c.name}</p>
                    {c.popular && <Star size={14} className="shrink-0 fill-amber-400 text-amber-400" />}
                  </div>
                  <p className="text-xs text-gray-400">/{c.slug}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openModal(c)} className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-brand-600" title="Edit" aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleting(c)} className="rounded-lg p-2 text-gray-500 transition hover:bg-rose-50 hover:text-rose-600" title="Delete" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {c.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{c.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.subCategories?.slice(0, 6).map((sc) => (
                  <span key={sc} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">{sc}</span>
                ))}
                {(c.subCategories?.length || 0) > 6 && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-400">+{c.subCategories.length - 6}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing._id ? `Edit "${editing.name}"` : 'New category'} onClose={() => setEditing(null)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Slug *</label>
              <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} className="input" placeholder="e.g. graphic-design" />
            </div>
          </div>
          <label className="label mt-4">Description</label>
          <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="input resize-none" />
          <label className="label mt-4">Icon key</label>
          <input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="input" placeholder="code, palette, megaphone…" />

          <label className="label mt-4">Sub-categories</label>
          <div className="flex gap-2">
            <input value={subInput} onChange={(e) => setSubInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } }} placeholder="Add and press Enter" className="input" />
            <button type="button" onClick={addSub} className="btn-secondary shrink-0"><Plus size={16} /></button>
          </div>
          {editing.subCategories?.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {editing.subCategories.map((sc, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                  {sc}
                  <button type="button" onClick={() => setEditing({ ...editing, subCategories: editing.subCategories.filter((_, j) => j !== i) })} className="text-brand-400 hover:text-rose-500"><X size={12} /></button>
                </span>
              ))}
            </div>
          )}

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" checked={editing.popular} onChange={(e) => setEditing({ ...editing, popular: e.target.checked })} className="h-4 w-4 accent-brand-600" />
            Show on homepage as popular
          </label>

          <button onClick={save} disabled={busy} className="btn-primary mt-5 w-full !py-3">
            {busy ? <Spinner size={17} className="text-white" /> : <CheckCircle2 size={16} />} {editing._id ? 'Save changes' : 'Create category'}
          </button>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete category" onClose={() => setDeleting(null)}>
          <p className="text-sm text-gray-600">
            Delete <span className="font-bold text-gray-900">{deleting.name}</span>? Existing gigs in this category will remain but won't be grouped.
          </p>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setDeleting(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => remove(deleting)} disabled={busy} className="btn-primary flex-1 !bg-rose-600 hover:!bg-rose-700">
              {busy ? <Spinner size={16} className="text-white" /> : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );

  function addSub() {
    const s = subInput.trim();
    if (!s) return;
    const exists = (editing.subCategories || []).some((x) => x.toLowerCase() === s.toLowerCase());
    if (exists) return setSubInput('');
    setEditing({ ...editing, subCategories: [...(editing.subCategories || []), s] });
    setSubInput('');
  }
}