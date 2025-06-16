import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, count }) {
  if (!rating) return null;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={15}
            className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-gray-500">{rating.toFixed(1)}</span>
      {count != null && <span className="text-xs text-gray-400">({count})</span>}
    </span>
  );
}
