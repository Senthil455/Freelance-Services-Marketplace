import { Link } from 'react-router-dom';
import { BadgeCheck, Eye, Heart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../api/client.js';
import { toast } from 'react-toastify';
import { toggleFavoriteLocal } from '../store/slices/uiSlice.js';
import { formatPrice } from '../utils/format.js';
import RatingStars from './RatingStars.jsx';
import Avatar from './Avatar.jsx';

export default function GigCard({ gig, compact = false }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const favorites = useSelector((s) => s.ui.favorites);

  const isFavorite = user ? favorites.includes(gig._id) : false;

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Please sign in to save gigs');
      return;
    }
    try {
      const { data } = await api.post('/users/favorites/toggle', { gigId: gig._id });
      dispatch(toggleFavoriteLocal(gig._id));
      toast.success(data.isFavorite ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const price =
    gig.packages?.basic?.price ??
    gig.packagesBasicPrice ??
    (gig.packages ? gig.packages.basic : null)?.price;

  return (
    <Link
      to={`/gig/${gig._id}`}
      className="group card overflow-hidden transition hover:shadow-lift"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={gig.images?.[0]}
          alt={gig.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {!compact && (
          <button
            onClick={toggleFavorite}
            aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
            className="absolute right-2.5 top-2.5 rounded-full bg-white/90 p-2 shadow transition hover:scale-105"
          >
            <Heart
              size={16}
              className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}
            />
          </button>
        )}
        {gig.featured && (
          <span className="absolute left-2.5 top-2.5 badge bg-brand-600 text-white">Featured</span>
        )}
      </div>
      <div className="p-3.5">
        <div className="mb-2 flex items-center gap-2">
          <Avatar user={gig.seller} size={24} />
          <span className="truncate text-sm font-medium text-gray-700">
            {typeof gig.seller === 'object' ? gig.seller.name : 'Seller'}
          </span>
          {typeof gig.seller === 'object' && gig.seller?.verifiedSeller && (
            <BadgeCheck size={15} className="shrink-0 text-brand-500" />
          )}
        </div>
        <p className={`line-clamp-2 text-[15px] leading-snug text-gray-800 group-hover:underline ${compact ? 'line-clamp-1' : ''}`}>
          {gig.title}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <RatingStars rating={gig.rating} count={gig.ratingCount} />
          <div className="text-right">
            <span className="block text-[11px] text-gray-500">From</span>
            <span className="text-base font-bold text-gray-900">{formatPrice(price)}</span>
          </div>
        </div>
        {!compact && (
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Eye size={13} /> {gig.views ?? 0} views
            </span>
            <span>{gig.sales ?? 0} sales</span>
          </div>
        )}
      </div>
    </Link>
  );
}