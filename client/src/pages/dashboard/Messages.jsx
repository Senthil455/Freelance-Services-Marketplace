import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChevronLeft, Send, Paperclip } from 'lucide-react';
import api from '../api/client';
import { Avatar } from '../components/Avatar.jsx';

export default function Messages() {
  const user = useSelector((s) => s.auth.user);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chat/conversations')
      .then((res) => setConversations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openConversation = (c) => {
    setActiveId(c._id);
    api.get(`/chat/conversations/${c._id}/messages`)
      .then((res) => setMessages(res.data))
      .catch(() => {});
  };

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    api.post(`/chat/conversations/${activeId}/messages`, { text })
      .then((res) => {
        setMessages((prev) => [...prev, res.data]);
        setText('');
      })
      .catch(() => {});
  };

  const active = conversations.find((c) => c._id === activeId);

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-center">
        <ChevronLeft className="h-6 w-6 text-slate-300" />
        <p className="text-sm text-slate-500">Select a conversation</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="w-72 border-r">
        {conversations.map((c) => {
          const other = c.participants?.find((p) => p._id !== user?._id) || c.participants?.[0];
          return (
            <div key={c._id} onClick={() => openConversation(c)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 ${c._id === activeId ? 'bg-slate-50' : ''}`}>
              <Avatar user={other} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{other?.name || 'User'}</p>
                <p className="truncate text-xs text-slate-500">{c.lastMessage?.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m._id} className={`flex ${m.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.sender?._id === user?._id ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="flex items-center gap-2 border-t p-3">
          <button type="button" className="text-slate-400 hover:text-slate-600"><Paperclip className="h-5 w-5" /></button>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" className="input flex-1" />
          <button type="submit" className="btn btn-primary"><Send className="h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );
}
