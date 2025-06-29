import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import api from '../api/client.js';
import GigCard from '../components/GigCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

const SORTS = [
  { value: 'bestSellers', label: 'Best sellers' },
  { value: 'topRated', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'priceAsc', label: 'Price: low to high' },
  { value: 'priceDesc', label: 'Price: high to low' },
];

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const subCategory = params.get('subCategory') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const minRating = params.get('minRating') || '';
  const sort = params.get('sort') || 'bestSellers';
  const page = Number(params.get('page') || 1);

  const [gigs, setGigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/gigs/search', { params: { q, category, subCategory, minPrice, maxPrice, minRating, sort, page, limit: 12 } })
      .then(({ data }) => {
        setGigs(data.gigs);
        setTotalPages(data.pagination?.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, category, subCategory, minPrice, maxPrice, minRating, sort, page]);

  const unsetEmpty = (obj) => {
    Object.keys(obj).forEach((k) => { if (!obj[k]) delete obj[k]; });
  };

  const patch = (vals) => {
    const next = { ...Object.fromEntries(params), ...vals, page: 1 };
    unsetEmpty(next);
    setParams(next);
  };

  const activeFilters = ['category', 'subCategory', 'minPrice', 'maxPrice', 'minRating'].filter((k) => params.get(k));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <p className="flex items-center gap-2 text-sm font-bold text-gray-800"><SlidersHorizontal size={16} /> Filters</p>

          <div className="mt-4">
            <label className="label">Category</label>
            <select value={category} onChange={(e) => patch({ category: e.target.value })} className="input">
              <option value="">All categories</option>
              {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>

          <div className="mt-3">
            <label className="label">Sub category</label>
            <input value={subCategory} onChange={(e) => patch({ subCategory: e.target.value })} placeholder="e.g. branding" className="input" />
          </div>

          <div className="mt-3">
            <label className="label">Min rating</label>
            <select value={minRating} onChange={(e) => patch({ minRating: e.target.value })} className="input">
              <option value="">Any</option>
              <option value="3">3+ stars</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>

          <div className="mt-3 flex gap-2">
            <div className="flex-1">
              <label className="label">Min price</label>
              <input type="number" min="0" value={minPrice} onChange={(e) => patch({ minPrice: e.target.value })} placeholder="Min" className="input" />
            </div>
            <div className="flex-1">
              <label className="label">Max price</label>
              <input type="number" min="0" value={maxPrice} onChange={(e) => patch({ maxPrice: e.target.value })} placeholder="Max" className="input" />
            </div>
          </div>

          {activeFilters.length > 0 && (
            <button type="button" onClick={() => setParams({ q })} className="mt-4 text-sm font-semibold text-brand-600 hover:underline">
              Clear all filters
            </button>
          )}
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900">
              {q ? `Results for "${q}"` : 'All services'}
            </h1>
            <select value={sort} onChange={(e) => patch({ sort: e.target.value })} className="input w-auto">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-24"><Spinner size={34} /></div>
          ) : gigs.length === 0 ? (
            <EmptyState title="No services found" description="Try adjusting your filters or search term" />
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-500">{gigs.length} services available</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {gigs.map((gig) => <GigCard key={gig._id} gig={gig} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={(p) => setParams({ ...Object.fromEntries(params), page: p })} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
