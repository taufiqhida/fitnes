import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function Chat() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user?.id) {
            fetchChatList();
        }
    }, [user]);

    useEffect(() => {
        if (selectedClient) {
            fetchMessages(selectedClient.id);
        }
    }, [selectedClient]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChatList = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coach/chat-list?coachId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
            if (res.data.length > 0 && !selectedClient) {
                setSelectedClient(res.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch chat list:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (clientId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coach/messages/${clientId}?coachId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedClient) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/coach/messages`, {
                senderId: user.id,
                receiverId: selectedClient.id,
                content: newMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewMessage('');
            fetchMessages(selectedClient.id);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="empty-state">Loading...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Konsultasi</h1>
            </div>

            {clients.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <MessageCircle size={48} />
                        <p>Belum ada client untuk konsultasi</p>
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '300px 1fr',
                    gap: '1.5rem',
                    height: 'calc(100vh - 180px)'
                }}>
                    {/* Client List */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '1rem',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Client</h3>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: 'calc(100% - 60px)' }}>
                            {clients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        border: 'none',
                                        background: selectedClient?.id === client.id
                                            ? 'rgba(124, 58, 237, 0.1)'
                                            : 'transparent',
                                        borderLeft: selectedClient?.id === client.id
                                            ? '3px solid var(--primary)'
                                            : '3px solid transparent',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        flexShrink: 0
                                    }}>
                                        {client.nama.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                                            {client.nama}
                                        </p>
                                        {client.lastMessage && (
                                            <p style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {client.lastMessage.content}
                                            </p>
                                        )}
                                    </div>
                                    {client.unreadCount > 0 && (
                                        <span style={{
                                            background: 'var(--primary)',
                                            color: 'white',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {client.unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {/* Chat Header */}
                        {selectedClient && (
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
                                    {selectedClient.nama.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedClient.nama}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedClient.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {messages.length === 0 ? (
                                <div className="empty-state">
                                    <MessageCircle size={48} />
                                    <p>Belum ada pesan</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isFromCoach = msg.senderId === user.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            style={{
                                                alignSelf: isFromCoach ? 'flex-end' : 'flex-start',
                                                maxWidth: '70%'
                                            }}
                                        >
                                            <div style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: isFromCoach
                                                    ? '1rem 1rem 0 1rem'
                                                    : '1rem 1rem 1rem 0',
                                                background: isFromCoach
                                                    ? 'linear-gradient(135deg, var(--primary), #a855f7)'
                                                    : 'rgba(15, 23, 42, 0.8)'
                                            }}>
                                                <p>{msg.content}</p>
                                            </div>
                                            <p style={{
                                                fontSize: '0.7rem',
                                                color: 'var(--text-muted)',
                                                marginTop: '0.25rem',
                                                textAlign: isFromCoach ? 'right' : 'left'
                                            }}>
                                                {formatTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        {selectedClient && (
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
                                <button type="submit" className="btn btn-primary">
                                    <Send size={18} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
