import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { ChevronLeft, Send, Paperclip } from 'lucide-react';
import api from '../api/client';
import { Avatar } from '../components/Avatar.jsx';

let socket = null;

export default function Messages() {
  const user = useSelector((s) => s.auth.user);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const openConversation = useCallback((c) => {
    setActiveId(c._id);
  }, []);

  useEffect(() => {
    api.get('/chat/conversations')
      .then((res) => setConversations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    api.get(`/chat/conversations/${activeId}/messages`)
      .then((res) => setMessages(res.data))
      .catch(() => {});
  }, [activeId]);

  useEffect(() => {
    if (!socket) socket = io();
    socket.emit('join-conversation', activeId);
    const offMessage = socket.on('new-message', (m) => {
      setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));
    });
    return () => { offMessage(); socket.emit('leave-conversation', activeId); };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    socket.emit('send-message', { conversationId: activeId, text });
    setText('');
  };

  return null;
}
