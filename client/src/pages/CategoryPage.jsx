import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import GigCard from '../components/GigCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function CategoryPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);
  const [gigs, setGigs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/gigs/search', { params: { category: slug, page, limit: 12 } })
      .then(({ data }) => {
        setGigs(data.gigs);
        setTotalPages(data.pagination?.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, page]);

  const title = (slug || '').replace(/-/g, ' ');

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold capitalize text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">Discover {title} services on SkillForge.</p>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={34} /></div>
      ) : gigs.length === 0 ? (
        <EmptyState title="No services yet" description="Be the first to offer this service" />
      ) : (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gigs.map((gig) => <GigCard key={gig._id} gig={gig} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </main>
  );
}
