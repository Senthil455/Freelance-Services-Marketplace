import { Link } from 'react-router-dom';
import { BadgeCheck, Eye } from 'lucide-react';
import { formatPrice } from '../utils/format.js';
import RatingStars from './RatingStars.jsx';
import Avatar from './Avatar.jsx';

export default function GigCard({ gig, compact = false }) {
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
        <p className="line-clamp-2 text-[15px] leading-snug text-gray-800 group-hover:underline">
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
