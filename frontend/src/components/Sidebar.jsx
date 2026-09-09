import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  Calendar, 
  HelpCircle, 
  Layers, 
  BarChart3, 
  BrainCircuit, 
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tutor', label: 'AI Tutor', icon: Bot, badge: 'RAG' },
  { id: 'materials', label: 'My Materials', icon: FileText },
  { id: 'study-plans', label: 'Study Plans', icon: Calendar },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'memory', label: 'Learning Memory', icon: BrainCircuit, badge: 'Memory' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside style={{
      width: '260px',
      background: 'rgba(11, 15, 25, 0.95)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem 1rem',
      userSelect: 'none'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem 1.5rem 0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            StudyMate AI
          </h1>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Intelligent Assistant
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1.25rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.7rem 0.85rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.1))' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color={isActive ? '#818cf8' : '#9ca3af'} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{item.badge}</span>
              ) : isActive ? (
                <ChevronRight size={14} color="#818cf8" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* System Status Footnote */}
      <div style={{
        padding: '0.85rem',
        borderRadius: '0.75rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f3f4f6' }}>Agent Online</p>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>RAG + Memory Active</p>
        </div>
      </div>
    </aside>
  );
}
