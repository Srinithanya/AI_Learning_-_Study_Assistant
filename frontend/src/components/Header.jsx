import React from 'react';
import { Search, Bell, User, Cpu, BookOpen } from 'lucide-react';

export default function Header({ user, memoryCount, docCount, onSearchClick }) {
  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(11, 15, 25, 0.5)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Search Bar / Quick Action */}
      <div 
        onClick={onSearchClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          padding: '0.5rem 1rem',
          width: '380px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem'
        }}
      >
        <Search size={16} color="#9ca3af" />
        <span>Search course notes, topics, or ask AI...</span>
        <kbd style={{
          marginLeft: 'auto',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '0.15rem 0.4rem',
          borderRadius: '0.375rem',
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}>⌘K</kbd>
      </div>

      {/* Right Stats & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Active Documents Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.35rem 0.75rem', borderRadius: '0.65rem' }}>
          <BookOpen size={14} color="#818cf8" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#c7d2fe' }}>{docCount} Materials Indexed</span>
        </div>

        {/* Memory Profile Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '0.35rem 0.75rem', borderRadius: '0.65rem' }}>
          <Cpu size={14} color="#22d3ee" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a5f3fc' }}>{memoryCount} Memory Insights</span>
        </div>

        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '1.25rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#ffffff',
            fontSize: '0.9rem'
          }}>
            {user?.full_name ? user.full_name.charAt(0) : 'A'}
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{user?.full_name || 'Alex Student'}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.target_exam || 'CS Semester Finals'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
