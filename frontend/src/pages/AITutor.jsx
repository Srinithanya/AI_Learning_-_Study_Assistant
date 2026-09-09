import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Cpu, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  Layers
} from 'lucide-react';
import { api } from '../api';

const PROMPT_SUGGESTIONS = [
  "Explain deadlock from my OS notes.",
  "Create a 7-day plan to study Computer Networks.",
  "Give me 5 practice questions on subnetting.",
  "Summarize Unit 2 from Data Structures.",
  "What is the difference between TCP and UDP?"
];

export default function AITutor() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      content: "Hello Alex! I am your **StudyMate AI Tutor**. I've indexed your uploaded materials for **Operating Systems**, **Computer Networks**, and **Data Structures**.\n\nAsk me anything about your course materials, request a personalized study plan, or generate practice quizzes!",
      tool_used: null,
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedSources, setExpandedSources] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.sendAgentMessage(text, conversationId);
      if (res.conversation_id && !conversationId) {
        setConversationId(res.conversation_id);
      }

      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        content: res.response,
        tool_used: res.tool_used,
        sources: res.sources || [],
        memories_saved: res.memories_saved || []
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          content: "I couldn't process your request right now. Please ensure the backend server is running on port 8000.",
          tool_used: null,
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSourceExpand = (msgId) => {
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        content: "Chat history cleared. Ask me anything from your course materials!",
        tool_used: null,
        sources: []
      }
    ]);
    setConversationId(null);
  };

  return (
    <div className="page-container animate-fade-in" style={{ height: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Bot size={24} color="#818cf8" />
            AI Study Tutor & Assistant
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Retrieval-Augmented Generation (RAG) active across all indexed materials
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }} onClick={handleClearChat}>
            <Trash2 size={14} /> Clear Chat
          </button>
        </div>
      </div>

      {/* Main Chat Log Window */}
      <div className="glass-card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', marginBottom: '1rem' }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const hasSources = msg.sources && msg.sources.length > 0;
          const isSourceExpanded = expandedSources[msg.id];

          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                gap: '1rem',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: isUser ? '75%' : '88%',
                flexDirection: isUser ? 'row-reverse' : 'row'
              }}
            >
              {/* Avatar Icon */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '0.75rem',
                background: isUser ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: isUser ? '0 0 15px rgba(16, 185, 129, 0.3)' : '0 0 15px rgba(99, 102, 241, 0.3)'
              }}>
                {isUser ? <User size={18} color="#ffffff" /> : <Bot size={20} color="#ffffff" />}
              </div>

              {/* Message Bubble */}
              <div style={{
                background: isUser ? 'rgba(16, 185, 129, 0.12)' : 'rgba(30, 41, 59, 0.8)',
                border: isUser ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: isUser ? '1.25rem 0.25rem 1.25rem 1.25rem' : '0.25rem 1.25rem 1.25rem 1.25rem',
                padding: '1.15rem 1.35rem',
                color: '#ffffff',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                position: 'relative'
              }}>
                {/* Agent Tool Call Indicator Badge */}
                {msg.tool_used && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                    <Cpu size={12} color="#818cf8" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#c7d2fe' }}>
                      Agent Tool Execution: <code>{msg.tool_used}</code>
                    </span>
                  </div>
                )}

                {/* Content Text with line breaks */}
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                {/* Auto Memory Saved Indicator */}
                {msg.memories_saved && msg.memories_saved.length > 0 && (
                  <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cpu size={14} color="#22d3ee" />
                    <span style={{ fontSize: '0.75rem', color: '#a5f3fc', fontWeight: 600 }}>
                      Memory Saved: {msg.memories_saved.join(', ')}
                    </span>
                  </div>
                )}

                {/* RAG Sources Footnote Accordion */}
                {hasSources && (
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <button 
                      onClick={() => toggleSourceExpand(msg.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#818cf8',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: 0
                      }}
                    >
                      <BookOpen size={14} />
                      <span>{msg.sources.length} RAG Source Citations Attached</span>
                      {isSourceExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isSourceExpanded && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {msg.sources.map((src, idx) => (
                          <div 
                            key={idx}
                            style={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(99, 102, 241, 0.25)',
                              borderRadius: '0.5rem',
                              padding: '0.65rem 0.85rem',
                              fontSize: '0.78rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93c5fd', fontWeight: 600, marginBottom: '0.25rem' }}>
                              <span>📄 {src.document_name} (Page {src.page_number})</span>
                              <span style={{ color: '#34d399' }}>Relevance: {src.relevance_score * 100}%</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{src.snippet}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Footers */}
                {!isUser && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => copyToClipboard(msg.id, msg.content)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem' }}
                    >
                      {copiedId === msg.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      {copiedId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '0.75rem', background: 'rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="#818cf8" />
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '0.25rem 1.25rem 1.25rem 1.25rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#818cf8" className="animate-spin" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Agent searching course materials & synthesizing answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestion Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
        {PROMPT_SUGGESTIONS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '9999px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input 
          type="text" 
          placeholder="Ask a question about your uploaded notes or request a study plan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          style={{
            flex: 1,
            background: 'rgba(17, 24, 39, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '0.85rem',
            padding: '0.85rem 1.25rem',
            color: '#ffffff',
            fontSize: '0.95rem',
            outline: 'none'
          }}
        />
        <button 
          className="btn-primary" 
          onClick={() => handleSendMessage()}
          disabled={loading || !input.trim()}
          style={{ padding: '0 1.5rem' }}
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </div>

    </div>
  );
}
