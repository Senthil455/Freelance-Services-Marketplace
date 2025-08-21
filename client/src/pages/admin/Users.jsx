import { useEffect, useState } from 'react';
import { Search, ShieldCheck, ShieldOff, BadgeCheck, Store, UserX } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import Pagination from '../../components/Pagination.jsx';
import Avatar from '../../components/Avatar.jsx';
import { formatDate } from '../../utils/format.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), limit: '15' });
    if (query) q.set('query', query);
    if (role !== 'all') q.set('role', role);
    api.get(`/admin/users?${q.toString()}`)
      .then(({ data }) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, role]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const updateUser = async (u, patch) => {
    setBusy(u._id);
    try {
      await api.put(`/admin/users/${u._id}`, patch);
      toast.success('User updated');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h2 text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">{total} registered users</p>
        </div>
        <div className="flex gap-2">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input w-auto !py-2">
            <option value="all">All roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email…" className="input !pl-9 !py-2" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={30} /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3.5 font-bold">User</th>
                <th className="px-4 py-3.5 font-bold">Role</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 font-bold">Joined</th>
                <th className="px-5 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u._id} className="transition hover:bg-gray-50/70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} size={36} />
                      <div>
                        <p className="font-bold text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge capitalize ${u.role === 'admin' ? 'bg-gray-900 text-white' : u.role === 'seller' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}{u.isSeller && u.role !== 'seller' ? ' (+seller)' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${u.accountStatus === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {u.accountStatus}
                    </span>
                    {u.verifiedSeller && <span className="badge ml-1.5 bg-amber-100 text-amber-700"><BadgeCheck size={11} /> Verified</span>}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <ActionBtn
                        title={u.accountStatus === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        onClick={() => updateUser(u, { accountStatus: u.accountStatus === 'suspended' ? 'active' : 'suspended' })}
                        disabled={busy === u._id || u.role === 'admin'}
                        icon={u.accountStatus === 'suspended' ? <ShieldCheck size={14} /> : <UserX size={14} />}
                        className="!text-rose-600 hover:!bg-rose-50"
                      />
                      <ActionBtn
                        title={u.verifiedSeller ? 'Unverify seller' : 'Verify seller'}
                        onClick={() => updateUser(u, { verifiedSeller: !u.verifiedSeller })}
                        disabled={busy === u._id || u.role === 'admin'}
                        icon={<BadgeCheck size={14} />}
                        className={u.verifiedSeller ? '!text-amber-600 hover:!bg-amber-50' : 'text-gray-500 hover:!bg-gray-100'}
                      />
                      <ActionBtn
                        title={u.isSeller ? 'Remove seller access' : 'Make seller'}
                        onClick={() => updateUser(u, { isSeller: !u.isSeller, role: !u.isSeller && u.role === 'buyer' ? 'seller' : u.role })}
                        disabled={busy === u._id || u.role === 'admin'}
                        icon={<Store size={14} />}
                        className={u.isSeller ? '!text-brand-600 hover:!bg-brand-50' : 'text-gray-500 hover:!bg-gray-100'}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function ActionBtn({ icon, title, onClick, disabled, className = '' }) {
  return (
    <button title={title} aria-label={title} onClick={onClick} disabled={disabled} className={`rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-40 ${className}`}>
      {icon}
    </button>
  );
}