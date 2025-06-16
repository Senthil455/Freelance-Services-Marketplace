import { initials } from '../utils/format.js';

export default function Avatar({ user, size = 40, className = '' }) {
  const src = user?.avatar;
  const name = user?.name || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={`flex items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 ${className}`}
    >
      {initials(name)}
    </div>
  );
}
