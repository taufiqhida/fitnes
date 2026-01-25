import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5002/api';

export default function ClientChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user?.id) {
            fetchMessages();
        }
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client/messages?clientId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/client/messages`, {
                clientId: user.id,
                content: newMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengirim pesan');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.createdAt).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Konsultasi</h1>
            </div>

            <div className="data-card" style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600
                    }}>
                        <User size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Pelatih</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Chat dengan pelatih Anda</p>
                    </div>
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {loading ? (
                        <div className="empty-state">Loading...</div>
                    ) : messages.length === 0 ? (
                        <div className="empty-state">
                            <MessageCircle size={48} />
                            <p>Belum ada pesan</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Mulai konsultasi dengan pelatih Anda
                            </p>
                        </div>
                    ) : (
                        Object.entries(groupedMessages).map(([date, msgs]) => (
                            <div key={date}>
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '1rem',
                                    position: 'relative'
                                }}>
                                    <span style={{
                                        background: 'var(--bg-secondary)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)'
                                    }}>
                                        {formatDate(date)}
                                    </span>
                                </div>
                                {msgs.map(msg => {
                                    const isFromClient = msg.senderId === user.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            style={{
                                                alignSelf: isFromClient ? 'flex-end' : 'flex-start',
                                                maxWidth: '70%',
                                                marginBottom: '0.75rem',
                                                marginLeft: isFromClient ? 'auto' : 0
                                            }}
                                        >
                                            <div style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: isFromClient
                                                    ? '1rem 1rem 0 1rem'
                                                    : '1rem 1rem 1rem 0',
                                                background: isFromClient
                                                    ? 'linear-gradient(135deg, var(--primary), #a855f7)'
                                                    : 'rgba(15, 23, 42, 0.8)'
                                            }}>
                                                <p>{msg.content}</p>
                                            </div>
                                            <p style={{
                                                fontSize: '0.7rem',
                                                color: 'var(--text-muted)',
                                                marginTop: '0.25rem',
                                                textAlign: isFromClient ? 'right' : 'left'
                                            }}>
                                                {formatTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '0.75rem'
                }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Ketik pesan..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={sending}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
