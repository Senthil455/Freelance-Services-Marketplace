import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import api from '../../api/client.js';
import GigCard from '../../components/GigCard.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function DashboardWishlist() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/favorites')
      .then(({ data }) => setGigs(data.gigs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h2 text-gray-900">Wishlist</h1>
        <p className="mt-1 text-sm text-gray-500">{gigs.length} saved service{gigs.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : gigs.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          subtitle="Tap the heart icon on any service to save it here for later."
          icon={<Heart size={26} />}
          action={<Link to="/search" className="btn-primary"><ShoppingBag size={16} /> Browse services</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => <GigCard key={gig._id} gig={gig} />)}
        </div>
      )}
    </div>
  );
}