import { Star } from 'lucide-react';

export default function RatingStars({ rating, count, size = 15, className = '' }) {
  const r = Number(rating) || 0;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Star size={size} className="fill-amber-400 text-amber-400" />
      <span className="text-sm font-bold" style={{ fontSize: size - 2 }}>
        {r.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-gray-500" style={{ fontSize: size - 3 }}>
          ({count})
        </span>
      )}
    </span>
  );
}