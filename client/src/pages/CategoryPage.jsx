import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../api/client.js';
import GigCard from '../components/GigCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [subCategory, setSubCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => {
        const found = (data.categories || []).find((c) => c.slug === slug);
        setCategory(found);
        if (!found) throw new Error('notfound');
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    const params = new URLSearchParams({ category: category.name, sort: 'bestSellers', limit: '12', page: String(page) });
    if (subCategory) params.set('subCategory', subCategory);
    api.get(`/gigs/search?${params.toString()}`)
      .then(({ data }) => {
        setGigs(data.gigs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        window.scrollTo({ top: 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, subCategory, page]);

  if (!category) {
    return <div className="flex justify-center py-32"><Spinner size={34} /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-gray-800">{category.name}</span>
      </nav>

      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-9 sm:px-10">
        <h1 className="text-3xl font-extrabold text-white">{category.name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-100">{category.description || `Browse top-rated ${category.name} services from verified freelancers.`}</p>
      </div>

      {category.subCategories?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setSubCategory('')} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${!subCategory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            All
          </button>
          {category.subCategories.map((sc) => (
            <button key={sc} onClick={() => { setSubCategory(sc); setPage(1); }} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${subCategory === sc ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {sc}
            </button>
          ))}
        </div>
      )}

      <p className="mt-6 text-sm text-gray-500">{total} services available</p>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : gigs.length === 0 ? (
        <div className="mt-4"><EmptyState title="No services in this category yet" subtitle="Check back soon or browse other categories." /></div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gigs.map((gig) => <GigCard key={gig._id} gig={gig} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}