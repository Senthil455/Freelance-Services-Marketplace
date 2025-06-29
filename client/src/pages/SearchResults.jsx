import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import GigCard from '../components/GigCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const page = Number(params.get('page') || 1);
  const [gigs, setGigs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/gigs/search', { params: { q, page, limit: 12 } })
      .then(({ data }) => {
        setGigs(data.gigs);
        setTotalPages(data.pagination?.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, page]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-gray-900">
        {q ? `Results for "${q}"` : 'All services'}
      </h1>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={34} /></div>
      ) : gigs.length === 0 ? (
        <EmptyState title="No services found" description="Try a different search term or category" />
      ) : (
        <>
          <p className="mt-2 text-sm text-gray-500">{gigs.length} services available</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gigs.map((gig) => <GigCard key={gig._id} gig={gig} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={(p) => setParams({ q, page: p })} />
        </>
      )}
    </main>
  );
}
