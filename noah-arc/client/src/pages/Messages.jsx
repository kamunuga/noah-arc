import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialWith = searchParams.get('with');

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(initialWith || null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  async function loadConversations() {
    const { conversations } = await api.get('/messages/conversations');
    setConversations(conversations);
  }

  async function loadThread(otherId) {
    if (!otherId) return;
    try {
      const data = await api.get(`/messages/with/${otherId}`);
      setThread(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { loadThread(activeId); }, [activeId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ block: 'nearest' }); }, [thread]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    try {
      await api.post('/messages', { receiverId: activeId, content: text });
      setText('');
      loadThread(activeId);
      loadConversations();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container section">
      <div className="section-head">
        <span className="eyebrow">Inbox</span>
        <h2>Messages</h2>
      </div>
      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 420, gap: 0, padding: 0, overflow: 'hidden' }}>
        <div className="thread-list" style={{ borderRight: '1px solid var(--line)', padding: 10 }}>
          {conversations.length === 0 && !activeId && (
            <p className="text-muted" style={{ fontSize: '0.85rem', padding: 10 }}>No conversations yet.</p>
          )}
          {conversations.map(c => (
            <div key={c.otherId} className={`thread-item${activeId === c.otherId ? ' active' : ''}`} onClick={() => setActiveId(c.otherId)}>
              <div className="avatar-circle" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>{c.other?.name?.charAt(0)}</div>
              <div className="thread-meta">
                <div className="name">{c.other?.name}</div>
                <div className="preview">{c.lastMessage.content}</div>
              </div>
              {c.unread > 0 && <span className="unread-dot" />}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', padding: 18 }}>
          {!activeId || !thread ? (
            <div className="empty-state" style={{ margin: 'auto' }}>Select a conversation to start chatting.</div>
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                {thread.other?.name} <span className="text-muted" style={{ fontWeight: 400, fontSize: '0.8rem' }}>· {thread.other?.role}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {thread.messages.map(m => (
                  <div key={m.id} className={`chat-bubble ${m.sender_id === user.id ? 'mine' : 'theirs'}`}>
                    {m.content}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type a message…"
                  style={{ flex: 1, background: 'var(--surface-raised)', border: '1px solid var(--line)', color: 'var(--text)', padding: '11px 14px', borderRadius: 8 }}
                />
                <button className="btn btn-primary" type="submit">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
