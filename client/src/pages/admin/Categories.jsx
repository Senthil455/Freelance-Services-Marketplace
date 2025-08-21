import { useEffect, useState } from 'react';
import { Plus, Star, CheckCircle2 } from 'lucide-react';
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

  const load = () => {
    setLoading(true);
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async () => {
    if (!editing.name.trim() || !editing.slug.trim()) return toast.error('Name and slug are required');
    setBusy(true);
    try {
      await api.post('/categories', editing);
      toast.success('Category created');
      setEditing(null);
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
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary"><Plus size={16} /> New category</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c._id} className="card p-5">
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-bold text-gray-900">{c.name}</p>
                {c.popular && <Star size={14} className="shrink-0 fill-amber-400 text-amber-400" />}
              </div>
              <p className="text-xs text-gray-400">/{c.slug}</p>
              {c.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{c.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.subCategories && c.subCategories.slice(0, 6).map((sc) => (
                  <span key={sc} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">{sc}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title="New category" onClose={() => setEditing(null)}>
          <label className="label">Name *</label>
          <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" />
          <label className="label mt-4">Slug *</label>
          <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} className="input" placeholder="e.g. graphic-design" />
          <label className="label mt-4">Description</label>
          <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="input resize-none" />
          <button onClick={save} disabled={busy} className="btn-primary mt-5 w-full !py-3">
            {busy ? <Spinner size={17} className="text-white" /> : <CheckCircle2 size={16} />} Create category
          </button>
        </Modal>
      )}
    </div>
  );
}
