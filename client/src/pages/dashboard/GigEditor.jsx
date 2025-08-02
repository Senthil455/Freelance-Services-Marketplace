import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, Plus, Trash2, Upload, X, Store, CheckCircle2, Image as ImageIcon, Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import { becomeSeller } from '../../store/slices/authSlice.js';
import { useAppDispatch } from '../../hooks/useAppDispatch.js';
import Spinner from '../../components/Spinner.jsx';

const EMPTY_PACKAGE = (name, title) => ({ name, title, description: '', price: 25, deliveryDays: 3, revisions: 0, features: [] });
const NEW_CAT = '__new__';

export default function GigEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useSelector((s) => s.auth);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [requirements, setRequirements] = useState(['', '', '']);
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const [images, setImages] = useState([]); // new files
  const [existingImages, setExistingImages] = useState([]); // edit mode
  const [removedImages, setRemovedImages] = useState([]);
  const [packages, setPackages] = useState({
    basic: EMPTY_PACKAGE('basic', 'Basic'),
    standard: EMPTY_PACKAGE('standard', 'Standard'),
    premium: EMPTY_PACKAGE('premium', 'Premium'),
  });
  const fileInput = useRef(null);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api.get(`/gigs/${id}`)
      .then(({ data }) => {
        const g = data.gig;
        setTitle(g.title);
        setDescription(g.description);
        setCategory(g.category);
        setSubCategory(g.subCategory || '');
        setSeoTitle(g.seoTitle || '');
        setTags(g.tags || []);
        setRequirements((g.requirements || []).length ? g.requirements : ['', '', '']);
        setFaqs(g.faqs?.length ? g.faqs : [{ question: '', answer: '' }]);
        setExistingImages(g.images || []);
        if (g.packages) {
          setPackages({
            basic: { ...EMPTY_PACKAGE('basic', 'Basic'), ...g.packages.basic },
            standard: { ...EMPTY_PACKAGE('standard', 'Standard'), ...g.packages.standard },
            premium: { ...EMPTY_PACKAGE('premium', 'Premium'), ...g.packages.premium },
          });
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const setPkg = (key, field, value) => {
    setPackages((p) => ({ ...p, [key]: { ...p[key], [field]: value } }));
  };

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
    if (user?.role === 'buyer' && !user?.isSeller) {
      return toast.info('Become a seller to create gigs');
    }
    if (title.trim().length < 10) return toast.error('Title must be at least 10 characters');
    if (description.trim().length < 30) return toast.error('Description must be at least 30 characters');
    if (!category) return toast.error('Please select a category');
    for (const key of ['basic', 'standard', 'premium']) {
      const p = packages[key];
      if (!p.title.trim() || !p.description.trim()) return toast.error(`Complete the ${key} package`);
      if (!p.price || p.price < 5) return toast.error('Minimum price is $5');
      if (!p.deliveryDays || p.deliveryDays < 1) return toast.error('Delivery time must be at least 1 day');
    }
    if (!isEdit && images.length === 0) return toast.error('Upload at least one image');

    setSubmitting(true);
    const body = new FormData();
    body.append('title', title.trim());
    body.append('description', description.trim());
    body.append('category', category);
    body.append('subCategory', subCategory);
    body.append('tags', JSON.stringify(tags));
    body.append('requirements', JSON.stringify(requirements.filter((r) => r.trim())));
    body.append('faqs', JSON.stringify(faqs.filter((f) => f.question.trim() && f.answer.trim())));
    body.append('seoTitle', seoTitle);
    body.append('packages', JSON.stringify(packages));
    if (removedImages.length) body.append('removeImages', JSON.stringify(removedImages));
    images.forEach((f) => body.append('images', f));

    try {
      if (isEdit) {
        await api.put(`/gigs/${id}`, body);
        toast.success('Gig updated');
      } else {
        const { data } = await api.post('/gigs', body);
        toast.success('Gig published!');
        navigate(`/gig/${data.gig._id}`, { replace: true });
        return;
      }
      navigate('/dashboard/gigs', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const becomeSellerClick = async () => {
    try {
      await dispatch(becomeSeller());
      toast.success('You are now a seller!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size={30} /></div>;

  if (user?.role === 'buyer') {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Store size={30} /></div>
        <h1 className="mt-5 text-2xl font-extrabold text-gray-900">Become a seller to create gigs</h1>
        <p className="mt-2 text-sm text-gray-500">Activate your seller account — it's free and takes one click.</p>
        <button onClick={becomeSellerClick} className="btn-primary mt-6"><Sparkles size={16} /> Become a seller</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/dashboard/gigs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-600">
            <ArrowLeft size={15} /> My gigs
          </Link>
          <h1 className="mt-1 h2 text-gray-900">{isEdit ? 'Edit gig' : 'Create a new gig'}</h1>
          <p className="mt-1 text-sm text-gray-500">Complete all three packages — they appear side by side to buyers.</p>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? <Spinner size={17} className="text-white" /> : isEdit ? 'Save changes' : 'Publish gig'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card title="Basics">
            <label className="label">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will build a stunning responsive website…" maxLength={120} className="input" />
            <p className="mt-1 text-right text-xs text-gray-400">{title.length}/120</p>

            <label className="label mt-4">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={7} maxLength={8000} placeholder="Describe your service, experience and what the buyer gets…" className="input resize-none" />
            <p className="mt-1 text-right text-xs text-gray-400">{description.length}/8000</p>
          </Card>

          <Card title="Category & tags">
            <div className="grid gap-4 sm:grid-cols-2">
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
          </Card>

          <Card title="Pricing packages">
            <p className="text-xs text-gray-500">Buyers compare these side by side — make each package progressively richer.</p>
            <div className="mt-4 space-y-4">
              {['basic', 'standard', 'premium'].map((key) => (
                <PackageEditor key={key} label={key} pkg={packages[key]} onChange={(f, v) => setPkg(key, f, v)} />
              ))}
            </div>
          </Card>

          <Card title="Requirements from buyer">
            <p className="text-xs text-gray-500">Questions the buyer answers before the order starts.</p>
            <div className="mt-3 space-y-2.5">
              {requirements.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input value={r} onChange={(e) => setRequirements(requirements.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Requirement ${i + 1}`} className="input" />
                  <button type="button" onClick={() => setRequirements(requirements.filter((_, j) => j !== i))} className="btn-secondary shrink-0 !px-3" aria-label="Remove requirement"><Trash2 size={15} /></button>
                </div>
              ))}
              <button type="button" onClick={() => setRequirements([...requirements, ''])} className="btn-ghost !text-brand-600">
                <Plus size={15} /> Add requirement
              </button>
            </div>
          </Card>

          <Card title="FAQs (optional)">
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-3.5">
                  <div className="flex gap-2">
                    <input value={f.question} onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))} placeholder="Question" className="input" />
                    <button type="button" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="btn-secondary shrink-0 !px-3" aria-label="Remove FAQ"><Trash2 size={15} /></button>
                  </div>
                  <textarea value={f.answer} onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))} rows={2} placeholder="Answer" className="input mt-2 resize-none" />
                </div>
              ))}
              <button type="button" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} className="btn-ghost !text-brand-600">
                <Plus size={15} /> Add FAQ
              </button>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Gallery">
            <button type="button" onClick={() => fileInput.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-8 text-gray-400 transition hover:border-brand-400 hover:text-brand-600">
              <ImageIcon size={26} />
              <span className="text-sm font-bold">{isEdit ? 'Add more images' : 'Upload images (max 5)'}</span>
              <span className="text-xs">PNG, JPG, WEBP · up to 10MB each</span>
            </button>
            <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => setImages([...images, ...Array.from(e.target.files || [])].slice(0, 5))} />

            {(existingImages.length > 0 || images.length > 0) && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {existingImages.filter((img) => !removedImages.includes(img)).map((img, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setRemovedImages([...removedImages, img])} className="absolute right-1 top-1 rounded-full bg-rose-500 p-1 text-white opacity-0 transition group-hover:opacity-100" aria-label="Remove image">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.map((img, i) => (
                  <div key={`n${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                    <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-rose-500 p-1 text-white" aria-label="Remove image">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {(existingImages.length + images.length) === 0 && <p className="mt-2 text-center text-xs text-gray-400">You'll be able to show buyers your work better with images.</p>}
          </Card>

          <Card title="Tips">
            <ul className="space-y-2 text-xs leading-relaxed text-gray-500">
              <li className="flex gap-2"><CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> Use a clear, specific title — "Logo design" beats "I will help you".</li>
              <li className="flex gap-2"><CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> High-quality images triple your chances of orders.</li>
              <li className="flex gap-2"><CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> Set realistic delivery times to keep your on-time rate high.</li>
              <li className="flex gap-2"><CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> Respond to messages within 12 hours to rank higher.</li>
            </ul>
          </Card>
        </aside>
      </div>

      <div className="flex justify-end gap-3 pb-8">
        <Link to="/dashboard/gigs" className="btn-secondary">Cancel</Link>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? <Spinner size={17} className="text-white" /> : isEdit ? 'Save changes' : 'Publish gig'}
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }) {
  return (
    <div className="card p-6">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function PackageEditor({ label, pkg, onChange }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white ${label === 'basic' ? 'bg-emerald-500' : label === 'standard' ? 'bg-brand-600' : 'bg-purple-500'}`}>
          {label}
        </span>
        <input value={pkg.title} onChange={(e) => onChange('title', e.target.value)} placeholder="Package title" className="input !py-1.5 flex-1 text-sm font-bold" />
      </div>
      <textarea value={pkg.description} onChange={(e) => onChange('description', e.target.value)} rows={2} maxLength={300} placeholder="Short description of this package" className="input mt-2 resize-none" />

      <div className="mt-2 grid grid-cols-3 gap-3">
        <div>
          <label className="label !text-xs">Price (USD) *</label>
          <input type="number" min="5" value={pkg.price} onChange={(e) => onChange('price', Number(e.target.value))} className="input" />
        </div>
        <div>
          <label className="label !text-xs">Delivery (days) *</label>
          <input type="number" min="1" max="90" value={pkg.deliveryDays} onChange={(e) => onChange('deliveryDays', Number(e.target.value))} className="input" />
        </div>
        <div>
          <label className="label !text-xs">Revisions</label>
          <input type="number" min="0" max="20" value={pkg.revisions} onChange={(e) => onChange('revisions', Number(e.target.value))} className="input" />
        </div>
      </div>

      <label className="label mt-3 !text-xs">Features (one per line)</label>
      <textarea
        value={pkg.features?.join('\n') || ''}
        onChange={(e) => onChange('features', e.target.value.split('\n').filter((f) => f.trim()))}
        rows={3}
        placeholder={'Responsive design\nSource files included\n…'}
        className="input resize-none"
      />
    </div>
  );
}