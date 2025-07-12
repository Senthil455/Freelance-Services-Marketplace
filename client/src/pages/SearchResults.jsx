import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import api from '../api/client.js';
import GigCard from '../components/GigCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'priceLow', label: 'Price: Low to High' },
  { value: 'priceHigh', label: 'Price: High to Low' },
  { value: 'bestSellers', label: 'Best Sellers' },
  { value: 'topRated', label: 'Top Rated' },
  { value: 'favorite', label: 'Most Reviewed' },
];

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const subCategory = params.get('subCategory') || '';
  const sort = params.get('sort') || 'relevance';
  const min = params.get('min') || '';
  const max = params.get('max') || '';
  const minRating = params.get('minRating') || '';
  const deliveryTime = params.get('deliveryTime') || '';
  const page = Number(params.get('page') || 1);

  const [categories, setCategories] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchBox, setSearchBox] = useState(q);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setSearchBox(q);
  }, [q]);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (q) query.set('q', q);
    if (category) query.set('category', category);
    if (subCategory) query.set('subCategory', subCategory);
    if (sort) query.set('sort', sort);
    if (min) query.set('min', min);
    if (max) query.set('max', max);
    if (minRating) query.set('minRating', minRating);
    if (deliveryTime) query.set('deliveryTime', deliveryTime);
    query.set('limit', '12');
    query.set('page', String(page));

    api.get(`/gigs/search?${query.toString()}`)
      .then(({ data }) => {
        setGigs(data.gigs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, category, subCategory, sort, min, max, minRating, deliveryTime, page]);

  const updateParams = useCallback((patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) next.delete(k);
      else next.set(k, v);
    });
    next.delete('page');
    setParams(next, { replace: true });
  }, [params, setParams]);

  const onSearch = (e) => {
    e.preventDefault();
    updateParams({ q: searchBox.trim() });
  };

  const categoryObj = categories.find((c) => c.slug === category);
  const activeFilters = [min, max, minRating, deliveryTime].filter(Boolean).length + (subCategory ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 rounded-xl bg-gradient-to-r from-brand-50 to-brand-100/60 p-5">
        <form onSubmit={onSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchBox} onChange={(e) => setSearchBox(e.target.value)} placeholder="Search services…" className="input !pl-10" />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="h2 text-gray-900">
          {q ? `Results for "${q}"` : category ? category : 'All services'}
          <span className="ml-2 text-base font-medium text-gray-400">({total})</span>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary !py-2 ${showFilters ? 'border-brand-400 text-brand-700' : ''}`}
          >
            <SlidersHorizontal size={15} /> Filters {activeFilters > 0 && <span className="badge bg-brand-600 text-white">{activeFilters}</span>}
          </button>
          <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })} className="input w-auto !py-2">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
        <aside className={`${showFilters ? 'block' : 'hidden'} mb-6 lg:mb-0 lg:block`}>
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Filters</h3>
              <button onClick={() => updateParams({ min: '', max: '', minRating: '', deliveryTime: '', subCategory: '', category: '' })} className="text-xs font-semibold text-brand-600 hover:underline">
                Clear all
              </button>
            </div>

            <FilterGroup title="Category">
              <div className="space-y-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                  <input type="radio" checked={!category} onChange={() => updateParams({ category: '', subCategory: '' })} className="accent-brand-600" />
                  All categories
                </label>
                {categories.map((c) => (
                  <label key={c._id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                    <input type="radio" checked={category === c.slug} onChange={() => updateParams({ category: c.slug, subCategory: '' })} className="accent-brand-600" />
                    {c.name}
                  </label>
                ))}
              </div>
            </FilterGroup>

            {categoryObj?.subCategories?.length > 0 && (
              <FilterGroup title="Sub-category">
                <div className="flex flex-wrap gap-1.5">
                  {categoryObj.subCategories.map((sc) => (
                    <button
                      key={sc}
                      onClick={() => updateParams({ subCategory: subCategory === sc ? '' : sc })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        subCategory === sc ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </FilterGroup>
            )}

            <FilterGroup title="Budget">
              <div className="flex items-center gap-2">
                <input type="number" min="0" placeholder="$5" value={min} onChange={(e) => updateParams({ min: e.target.value })} className="input !py-2" />
                <span className="text-gray-400">–</span>
                <input type="number" min="0" placeholder="$1000" value={max} onChange={(e) => updateParams({ max: e.target.value })} className="input !py-2" />
              </div>
            </FilterGroup>

            <FilterGroup title="Delivery time">
              <select value={deliveryTime} onChange={(e) => updateParams({ deliveryTime: e.target.value })} className="input !py-2">
                <option value="">Any time</option>
                <option value="1">Within 1 day</option>
                <option value="3">Within 3 days</option>
                <option value="7">Within 7 days</option>
                <option value="14">Within 14 days</option>
              </select>
            </FilterGroup>

            <FilterGroup title="Minimum rating">
              <div className="flex flex-wrap gap-1.5">
                {[4.5, 4, 3.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => updateParams({ minRating: minRating === String(r) ? '' : String(r) })}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      minRating === String(r) ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ★ {r}+
                  </button>
                ))}
              </div>
            </FilterGroup>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size={30} /></div>
          ) : gigs.length === 0 ? (
            <EmptyState
              title="No services found"
              subtitle="Try adjusting your search terms or removing some filters."
              action={<button onClick={() => { setParams({}, { replace: true }); setSearchBox(''); }} className="btn-secondary">Clear all filters</button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {gigs.map((gig) => <GigCard key={gig._id} gig={gig} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParams({ page: String(p) })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="border-t border-gray-100 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-gray-500">{title}</h4>
      {children}
    </div>
  );
}