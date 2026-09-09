import React, { useState, useEffect } from 'react';
import { BrainCircuit, Trash2, Plus, Sparkles, AlertCircle, Shield, Cpu } from 'lucide-react';
import { api } from '../api';

export default function LearningMemory() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState('weak_topic');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  const loadMemories = async () => {
    try {
      const data = await api.listMemories();
      setMemories(data || []);
    } catch (err) {
      console.error('Failed to load memory profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    try {
      await api.createMemory({ category, key, value });
      setKey('');
      setValue('');
      setShowAddForm(false);
      await loadMemories();
    } catch (err) {
      alert(`Failed to add memory: ${err.message}`);
    }
  };

  const handleDeleteMemory = async (id) => {
    try {
      await api.deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert(`Delete memory error: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all AI student memory insights?')) return;
    try {
      await api.clearAllMemories();
      setMemories([]);
    } catch (err) {
      alert(`Clear all error: ${err.message}`);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BrainCircuit size={26} color="#06b6d4" />
            AI Memory & Learning Profile Manager
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            The AI Study Agent persists your goals, weak topics, and preferences to continuously tailor study plans and answers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" style={{ borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fb7185' }} onClick={handleClearAll}>
            <Trash2 size={16} /> Clear All Memories
          </button>
          <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={18} /> Add Insight
          </button>
        </div>
      </div>

      {/* Manual Add Form */}
      {showAddForm && (
        <form className="glass-card animate-fade-in" onSubmit={handleAddMemory} style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="#06b6d4" />
            Add Custom Student Memory
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }}>
                <option value="goal">Exam Goal</option>
                <option value="weak_topic">Weak Area / Topic</option>
                <option value="preferred_style">Learning Preference</option>
                <option value="active_course">Active Course</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Memory Key</label>
              <input type="text" value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. Weak Area: Subnetting" style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Memory Content</label>
              <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. Requires extra practice questions on IP CIDR calculations." style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }} />
            </div>
          </div>

          <button className="btn-primary" type="submit">Save Insight to Memory</button>
        </form>
      )}

      {/* Memories Grid */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={20} color="#06b6d4" />
          Active Memory Profile ({memories.length} Items)
        </h3>

        {memories.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No memories stored yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {memories.map((mem) => (
              <div key={mem.id} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.85rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-cyan" style={{ textTransform: 'uppercase' }}>{mem.category}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{mem.created_at}</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{mem.key}</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{mem.value}</p>
                </div>

                <button onClick={() => handleDeleteMemory(mem.id)} style={{ background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
