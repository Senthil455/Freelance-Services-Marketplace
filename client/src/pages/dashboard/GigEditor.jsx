import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';

export default function GigEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (title.trim().length < 10) return toast.error('Title must be at least 10 characters');
    if (description.trim().length < 30) return toast.error('Description must be at least 30 characters');

    const body = new FormData();
    body.append('title', title.trim());
    body.append('description', description.trim());

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

      <div className="flex justify-end gap-3 pb-8">
        <Link to="/dashboard/gigs" className="btn-secondary">Cancel</Link>
        <button type="submit" className="btn-primary">{isEdit ? 'Save changes' : 'Publish gig'}</button>
      </div>
    </form>
  );
}
