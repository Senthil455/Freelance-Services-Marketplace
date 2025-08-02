import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { useAppDispatch, becomeSeller } from '../store/authSlice';
import { Spinner } from '../components/Spinner.jsx';

const NEW_CAT = '__new__';

export default function GigEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const isSeller = user?.role === 'seller' || user?.isSeller;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', tags: [], seoTitle: '',
    price: '', revisionPolicy: '', deliveryTime: '',
  });
  const [packages, setPackages] = useState([
    { name: 'Basic', price: '', deliveryDays: '', revisions: '', features: [] },
    { name: 'Standard', price: '', deliveryDays: '', revisions: '', features: [] },
    { name: 'Premium', price: '', deliveryDays: '', revisions: '', features: [] },
  ]);
  const [requirements, setRequirements] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [fileInput, setFileInput] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isSeller) { setLoading(false); return; }

    Promise.all([api.get('/gigs/categories'), api.get('/gigs/selling-tips')])
      .then(([catRes]) => setCategories(catRes.data))
      .catch(() => toast.error('Failed to load gig data'));

    if (id) {
      api.get(`/gigs/${id}`)
        .then((res) => {
          const g = res.data;
          setForm({
            title: g.title, description: g.description, tags: g.tags || [],
            seoTitle: g.seoTitle || '', price: g.price || '',
            revisionPolicy: g.revisionPolicy || '', deliveryTime: g.deliveryTime || '',
          });
          setCategory(g.category || '');
          setSubcategory(g.subcategory || '');
          setPackages(g.packages?.length ? g.packages : packages.map((p) => ({
            name: p.name, price: p.price ?? '', deliveryDays: p.deliveryDays ?? '',
            revisions: p.revisions ?? '', features: p.features || [],
          })));
          setRequirements(g.requirements || []);
          setFaqs(g.faqs || []);
          setExistingImages(g.images || []);
        })
        .catch(() => toast.error('Gig not found'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isSeller]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updatePackage = (i, patch) =>
    setPackages((list) => list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  if (loading) return <Spinner />;
  if (!isSeller) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-semibold">Become a seller</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Add a professional description, your skills and languages to start selling on SkillForge.
        </p>
        <button
          onClick={() => dispatch(becomeSeller())}
          className="btn btn-primary mt-5"
        >
          {user?.isSeller ? 'Continue as seller' : 'Become a seller'}
        </button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim() || form.title.trim().length < 5) errs.title = 'Title is required (min 5 characters)';
    if (!form.description.trim() || form.description.trim().length < 20) errs.description = 'Description is required (min 20 characters)';
    if (!category) errs.category = 'Packages are required';
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error(Object.values(errs)[0]);
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      category: category === NEW_CAT ? newCategory : category,
      subcategory, packages, requirements, faqs,
      existingImages, removedImages,
    };
    const fd = new FormData();
    fd.append('data', JSON.stringify(payload));
    images.forEach((img) => fd.append('images', img));

    const req = id
      ? api.put(`/gigs/${id}`, fd)
      : api.post('/gigs', fd);
    req
      .then(() => {
        toast.success(id ? 'Gig updated' : 'Gig created');
        navigate('/dashboard/gigs');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to save gig'))
      .finally(() => setSaving(false));
  };

  return null; // buyer gate and gallery wired in the final pass
}
