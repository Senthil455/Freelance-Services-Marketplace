import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';

export default function GigEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (tags.length >= 5) return toast.info('Maximum 5 tags');
    if (tags.includes(t)) return setTagInput('');
    setTags([...tags, t]);
    setTagInput('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (title.trim().length < 10) return toast.error('Title must be at least 10 characters');
    if (description.trim().length < 30) return toast.error('Description must be at least 30 characters');
    if (!category) return toast.error('Please select a category');

    const body = new FormData();
    body.append('title', title.trim());
    body.append('description', description.trim());
    body.append('category', category);
    body.append('subCategory', subCategory);
    body.append('tags', JSON.stringify(tags));
    body.append('seoTitle', seoTitle);

    try {
      if (isEdit) {
        await api.put(`/gigs/${id}`, body);
        toast.success('Gig updated');
      } else {
        await api.post('/gigs', body);
        toast.success('Gig published!');
      }
    } catch (err) { toast.error(err.message); }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <Link to="/dashboard/gigs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-600">
          <ArrowLeft size={15} /> My gigs
        </Link>
        <h1 className="mt-1 h2 text-gray-900">{isEdit ? 'Edit gig' : 'Create a new gig'}</h1>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-bold text-gray-900">Basics</h2>
        <label className="label mt-4">Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will build a stunning responsive website…" maxLength={120} className="input" />
        <label className="label mt-4">Description *</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={7} maxLength={8000} placeholder="Describe your service…" className="input resize-none" />
      </div>

      <div className="card p-6">
        <h2 className="text-base font-bold text-gray-900">Category &amp; tags</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category *</label>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(''); }} className="input">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Sub-category</label>
            <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="input">
              <option value="">— Optional —</option>
              {categories.find((c) => c.name === category)?.subCategories?.map((sc) => <option key={sc} value={sc}>{sc}</option>)}
            </select>
          </div>
        </div>
        <label className="label mt-4">Search tags (max 5)</label>
        <div className="flex gap-2">
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="e.g. react, landing page" className="input" />
          <button type="button" onClick={addTag} className="btn-secondary shrink-0"><Plus size={16} /></button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                {t}
                <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="text-brand-400 hover:text-rose-500"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
        <label className="label mt-4">SEO title (optional)</label>
        <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="A title optimized for search engines" maxLength={120} className="input" />
      </div>

      <div className="flex justify-end gap-3 pb-8">
        <Link to="/dashboard/gigs" className="btn-secondary">Cancel</Link>
        <button type="submit" className="btn-primary">{isEdit ? 'Save changes' : 'Publish gig'}</button>
      </div>
    </form>
  );
}
