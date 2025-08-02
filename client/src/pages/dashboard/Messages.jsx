import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare } from 'lucide-react';
import api from '../api/client';
import { Avatar } from '../components/Avatar.jsx';

export default function Messages() {
  const user = useSelector((s) => s.auth.user);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chat/conversations')
      .then((res) => setConversations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center text-sm text-slate-400">Loading conversations...</div>;

  return (
    <div className="h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Messages</h1>
      </div>
      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No conversations yet</p>
        </div>
      ) : (
        <div className="mt-4 divide-y rounded-2xl border border-slate-200 bg-white">
          {conversations.map((c) => {
            const other = c.participants?.find((p) => p._id !== user?._id) || c.participants?.[0];
            return (
              <div key={c._id} className="flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer">
                <Avatar user={other} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{other?.name || 'User'}</p>
                  <p className="truncate text-xs text-slate-500">{c.lastMessage?.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
