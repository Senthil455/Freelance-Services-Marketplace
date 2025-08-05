import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { MessageSquare, Send, Paperclip, ChevronLeft, User as UserIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/client.js';
import Avatar from '../../components/Avatar.jsx';
import Spinner from '../../components/Spinner.jsx';
import { timeAgo } from '../../utils/format.js';

let socket = null;
const ensureSocket = () => {
  if (!socket) socket = io();
  return socket;
};

export default function DashboardMessages() {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { conversations, activeConversation, messages } = useSelector((s) => s.chat);

  const [text, setText] = useState('');
  const [localConvs, setLocalConvs] = useState([]);
  const [typing, setTyping] = useState({});
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [mobileView, setMobileView] = useState(!!conversationId);
  const bottomRef = useRef(null);
  const textRef = useRef(null);

  const active = activeConversation;

  const loadConversations = useCallback(() => {
    api.get('/chat/conversations')
      .then(({ data }) => setLocalConvs(data.conversations || []))
      .catch(() => {});
  }, []);

  const handleSocketEvent = useCallback((event, fn) => {
    const s = ensureSocket();
    s.on(event, fn);
    return () => s.off(event, fn);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    const cleanups = [
      handleSocketEvent('new-message', (msg) => {
        if (activeConversation && msg.conversation === activeConversation._id) {
          dispatch({ type: 'chat/addMessage', payload: msg });
        }
        setLocalConvs((convs) => convs.map((c) => (c._id === msg.conversation ? { ...c, unreadCount: c._id !== activeConversation?._id ? (c.unreadCount || 0) + 1 : 0 } : c)));
      }),
      handleSocketEvent('conversation-updated', ({ conversationId: cid, lastMessagePreview, lastMessageAt, message: msg }) => {
        setLocalConvs((convs) => {
          const target = convs.find((c) => c._id === cid);
          const updated = { ...(target || { _id: cid }), lastMessagePreview, lastMessageAt };
          const rest = convs.filter((c) => c._id !== cid);
          if (msg) {
            const other = { _id: msg.sender._id, name: msg.sender.name, avatar: msg.sender.avatar };
            updated.other = updated.other || other;
          }
          return [updated, ...rest];
        });
        if (activeConversation && msg?.conversation === activeConversation._id) {
          dispatch({ type: 'chat/addMessage', payload: msg });
        }
      }),
      handleSocketEvent('typing', ({ conversationId: cid, user: u }) => {
        setTyping((t) => ({ ...t, [cid]: u.name }));
        setTimeout(() => setTyping((t) => ({ ...t, [cid]: null })), 2500);
      }),
      handleSocketEvent('messages-read', ({ conversationId: cid }) => {
        setLocalConvs((convs) => convs.map((c) => (c._id === cid ? { ...c, unreadCount: 0 } : c)));
      }),
    ];
    return () => cleanups.forEach((off) => off());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation, dispatch]);

  useEffect(() => {
    if (!conversationId) {
      dispatch({ type: 'chat/setActiveConversation', payload: null });
      dispatch({ type: 'chat/setMessages', payload: [] });
      return;
    }
    setLoadingMsgs(true);
    api.get(`/chat/conversations/${conversationId}/messages`)
      .then(({ data }) => {
        dispatch({ type: 'chat/setMessages', payload: data.messages || [] });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingMsgs(false));

    api.get('/chat/conversations')
      .then(({ data }) => {
        const found = (data.conversations || []).find((c) => c._id === conversationId);
        if (found) {
          dispatch({ type: 'chat/setActiveConversation', payload: found });
          setLocalConvs((convs) => {
            const rest = convs.filter((c) => c._id !== found._id);
            return [found, ...rest].filter((c, i, arr) => arr.findIndex((x) => x._id === c._id) === i);
          });
        }
      })
      .catch(() => {});

    ensureSocket().emit('join-conversation', conversationId);
    ensureSocket().emit('read-messages', conversationId);
    setMobileView(true);
    return () => ensureSocket().emit('leave-conversation', conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loadingMsgs]);

  const send = async (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    ensureSocket().emit('send-message', { conversationId: active._id, text: msg }, (ack) => {
      if (ack?.error) return toast.error(ack.error);
      if (ack?.success) {
        dispatch({ type: 'chat/addMessage', payload: ack.message });
        setLocalConvs((convs) => [
          { ...active, lastMessagePreview: msg.slice(0, 80), lastMessageAt: new Date().toISOString() },
          ...convs.filter((c) => c._id !== active._id),
        ]);
      }
    });
    setText('');
  };

  const sendAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !active) return;
    const body = new FormData();
    body.append('text', '');
    body.append('attachment', file);
    try {
      const { data } = await api.post(`/chat/conversations/${active._id}/messages`, body);
      dispatch({ type: 'chat/addMessage', payload: data.message });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const otherOf = (conv) => conv?.participants?.find((p) => p._id !== user?.id) || conv?.other || null;

  return (
    <div className="card flex h-[calc(100vh-11rem)] min-h-[480px] overflow-hidden">
      <div className={`w-full flex-col border-r border-gray-100 sm:w-80 lg:flex ${mobileView ? 'hidden' : 'flex'}`}>
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><MessageSquare size={17} className="text-brand-600" /> Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {localConvs.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <UserIcon size={26} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No conversations yet.<br />Message a seller from any gig page.</p>
            </div>
          ) : (
            localConvs.map((c) => {
              const other = otherOf(c);
              const isActive = active?._id === c._id;
              const isTyping = typing[c._id];
              return (
                <Link
                  key={c._id}
                  to={`/dashboard/messages/${c._id}`}
                  className={`flex items-start gap-3 border-b border-gray-50 px-4 py-3.5 transition ${isActive ? 'bg-brand-50/60' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative">
                    <Avatar user={other} size={44} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-gray-800">{other?.name || 'Conversation'}</p>
                      {c.lastMessageAt && <span className="shrink-0 text-[10px] text-gray-400">{timeAgo(c.lastMessageAt)}</span>}
                    </div>
                    {isTyping ? (
                      <p className="truncate text-xs font-semibold text-brand-600">typing…</p>
                    ) : (
                      <p className="truncate text-xs text-gray-500">{c.lastMessagePreview || 'Say hello 👋'}</p>
                    )}
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${mobileView ? 'flex' : 'hidden sm:flex'}`}>
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
            <MessageSquare size={34} className="text-gray-200" />
            <p className="mt-3 text-sm font-semibold text-gray-500">Select a conversation</p>
            <p className="mt-1 max-w-xs text-xs text-gray-400">Chat with sellers about their services before or after ordering.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
              <button onClick={() => setMobileView(false)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 sm:hidden" aria-label="Back">
                <ChevronLeft size={18} />
              </button>
              <Avatar user={otherOf(active)} size={38} />
              <div className="min-w-0">
                <Link to={`/seller/${otherOf(active)?._id}`} className="truncate text-sm font-bold text-gray-800 hover:underline">
                  {otherOf(active)?.name}
                </Link>
                <p className="text-[11px] text-gray-400">{otherOf(active)?.tagline || 'Freelancer'}</p>
              </div>
              {active.gig && (
                <Link to={`/gig/${active.gig._id}`} className="ml-auto hidden h-10 w-16 overflow-hidden rounded-lg border border-gray-200 sm:block">
                  <img src={active.gig.images?.[0]} alt="" className="h-full w-full object-cover" />
                </Link>
              )}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/60 p-4">
              {loadingMsgs && <div className="flex justify-center py-8"><Spinner size={22} /></div>}
              {!loadingMsgs && messages.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-400">No messages yet — say hello!</p>
              )}
              {messages.map((m) => {
                const mine = m.sender?._id === user?.id;
                return (
                  <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] sm:max-w-[60%] ${mine ? 'items-end' : 'items-start'}`}>
                      {m.attachment && (
                        <a href={m.attachment} target="_blank" rel="noreferrer" className="mb-1 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-50">
                          <Paperclip size={14} /> View attachment
                        </a>
                      )}
                      {m.text && (
                        <div className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${mine ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-white text-gray-800'}`}>
                          {m.text}
                        </div>
                      )}
                      <p className={`mt-1 px-1 text-[10px] text-gray-400 ${mine ? 'text-right' : ''}`}>
                        {m.sender?.name} · {timeAgo(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {typing[active._id] && <p className="text-xs font-semibold text-brand-600">{typing[active._id]} is typing…</p>}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={send} className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
              <label className="cursor-pointer rounded-lg p-2.5 text-gray-400 transition hover:bg-gray-100 hover:text-brand-600" title="Attach file">
                <Paperclip size={18} />
                <input type="file" hidden onChange={sendAttachment} />
              </label>
              <input
                ref={textRef}
                value={text}
                onChange={(e) => { setText(e.target.value); ensureSocket().emit('typing', active._id); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) send(e); }}
                placeholder="Type a message…"
                className="input flex-1"
              />
              <button type="button" onClick={send} className="btn-primary !px-4" aria-label="Send message" disabled={!text.trim()}>
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}