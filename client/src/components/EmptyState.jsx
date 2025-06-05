import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', subtitle, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        {icon || <PackageOpen size={26} />}
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="mt-1 max-w-md text-sm text-gray-500">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}