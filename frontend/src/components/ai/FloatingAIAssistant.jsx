import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaMinus, FaPaperPlane, FaExpand, FaCompress, FaCrown } from 'react-icons/fa';
import { sendMessage, clearHistory } from '../../services/aiService';
import { getWelcomeMessage } from '../../services/hotelDataService';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const LinkRenderer = ({ href, children }) => {
  const navigate = useNavigate();
  
  if (!href) return <>{children}</>;
  
  if (href.startsWith('/')) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          navigate(href);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--primary)',
          textDecoration: 'underline',
          cursor: 'pointer',
          padding: 0,
          font: 'inherit',
        }}
      >
        {children}
      </button>
    );
  }
  
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
      {children}
    </a>
  );
};

const FloatingAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Welcome to LuxuryStay. Loading room data...' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const dragRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    getWelcomeMessage().then(welcome => {
      setMessages([{ role: 'assistant', text: welcome }]);
    }).catch(() => {
      setMessages([{ role: 'assistant', text: 'Welcome to LuxuryStay. I am your personal concierge. How may I assist you today?' }]);
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const reply = await sendMessage(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('[AI Widget] sendMessage error:', err);
      setMessages(prev => [...prev, { role: 'assistant', text: 'I apologize, but I am unable to respond at the moment. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.chat-panel') || e.target.closest('.chat-icon')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      setPosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleNewChat = () => {
    clearHistory();
    setMessages([{ role: 'assistant', text: 'Starting new conversation...' }]);
    getWelcomeMessage().then(welcome => {
      setMessages([{ role: 'assistant', text: welcome }]);
    }).catch(() => {
      setMessages([{ role: 'assistant', text: 'Welcome to LuxuryStay. How may I assist you today?' }]);
    });
  };

  return (
    <>
      {isVisible && (
        <div
          ref={dragRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            position: 'fixed',
            zIndex: 9999,
            right: position.x === 0 && position.y === 0 ? '24px' : undefined,
            bottom: position.x === 0 && position.y === 0 ? '24px' : undefined,
            transform: position.x !== 0 || position.y !== 0 ? `translate(${position.x}px, ${position.y}px)` : undefined,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '12px',
            cursor: isDragging ? 'grabbing' : 'default',
            userSelect: 'none',
          }}
        >
          <AnimatePresence>
            {isOpen && !isMinimized && (
              <motion.div
                ref={chatRef}
                className="chat-panel"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                style={{
                  width: '360px',
                  height: '500px',
                  maxWidth: 'calc(100vw - 48px)',
                  maxHeight: 'calc(100vh - 180px)',
                  background: 'rgba(16, 16, 20, 0.92)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '20px',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(212, 175, 55, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12), transparent)',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px',
                      background: 'var(--gold-gradient)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FaCrown size={14} color="#000" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Concierge</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>AI Assistant</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={handleNewChat}
                      style={{
                        width: '30px', height: '30px',
                        background: 'rgba(255,255,255,0.06)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: '0.2s',
                      }}
                      title="New conversation"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14"/></svg>
                    </button>
                    <button
                      onClick={toggleMinimize}
                      style={{
                        width: '30px', height: '30px',
                        background: 'rgba(255,255,255,0.06)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: '0.2s',
                      }}
                    >
                      <FaMinus size={12} />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      style={{
                        width: '30px', height: '30px',
                        background: 'rgba(255,255,255,0.06)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: '0.2s',
                      }}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>

                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '12px 16px',
                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))'
                          : 'rgba(255,255,255,0.05)',
                        border: msg.role === 'user'
                          ? '1px solid rgba(212, 175, 55, 0.2)'
                          : '1px solid rgba(255,255,255,0.06)',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.85)',
                      }}
                      >
                      <ReactMarkdown
                        components={{ a: LinkRenderer }}
                        style={{
                          fontSize: '13px',
                          lineHeight: '1.6',
                          color: 'inherit',
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </motion.div>
                  ))}
                  {loading && (
                    <div style={{
                      alignSelf: 'flex-start',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '16px 16px 16px 4px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      gap: '4px',
                    }}>
                      <span style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite' }} />
                      <span style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s' }} />
                      <span style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s' }} />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{
                  padding: '12px 16px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-end',
                }}>
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '0 12px',
                    transition: '0.2s',
                  }}>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask your concierge..."
                      disabled={loading}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '13px',
                        padding: '12px 0',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    style={{
                      width: '42px', height: '42px',
                      background: input.trim() ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.06)',
                      border: 'none',
                      borderRadius: '12px',
                      color: input.trim() ? '#000' : 'rgba(255,255,255,0.2)',
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: '0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <FaPaperPlane size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isOpen && isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={toggleMinimize}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(16, 16, 20, 0.9)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '16px',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                fontSize: '13px',
                color: '#fff',
                fontWeight: 600,
              }}
            >
              <FaCrown color="var(--primary)" />
              <span>Concierge minimized</span>
              <FaExpand size={12} style={{ opacity: 0.5 }} />
            </motion.div>
          )}

          <motion.button
            className="chat-icon"
            onClick={toggleOpen}
            onMouseDown={(e) => e.stopPropagation()}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '56px',
              height: '56px',
              background: isOpen ? 'rgba(255,59,48,0.9)' : 'var(--gold-gradient)',
              border: '2px solid rgba(255,255,255,0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isOpen
                ? '0 4px 20px rgba(255,59,48,0.4)'
                : '0 4px 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)',
              transition: 'all 0.3s ease',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {isOpen ? <FaTimes size={20} color="#fff" /> : <FaRobot size={22} color="#000" />}
          </motion.button>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .chat-panel::-webkit-scrollbar { width: 4px; }
        .chat-panel::-webkit-scrollbar-track { background: transparent; }
        .chat-panel::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3); border-radius: 2px; }
      `}</style>
    </>
  );
};

export default FloatingAIAssistant;
