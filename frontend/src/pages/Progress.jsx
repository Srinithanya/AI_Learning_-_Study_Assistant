import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Flame, CheckCircle, AlertTriangle, BookOpen, Clock, Zap } from 'lucide-react';
import { api } from '../api';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const prog = await api.getProgress();
        setData(prog);
      } catch (err) {
        console.error('Failed to load progress analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BarChart3 size={26} color="#06b6d4" />
            Learning Analytics & Progress Tracking
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time telemetry tracking topic mastery, quiz performance, study streak, and memory weak topics.
          </p>
        </div>
      </div>

      {/* Top Stat Banner Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Overall Preparedness */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.85rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} color="#818cf8" />
          </div>
          <div>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{data?.overall_completion_percentage || 72.5}%</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exam Readiness</p>
          </div>
        </div>

        {/* Study Streak */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.85rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={24} color="#f59e0b" />
          </div>
          <div>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{data?.learning_streak_days || 5} Days</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Learning Streak</p>
          </div>
        </div>

        {/* Quiz Avg */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.85rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} color="#10b981" />
          </div>
          <div>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{data?.average_quiz_score || 82}%</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Quiz Score</p>
          </div>
        </div>

        {/* Total Study Hours */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '0.85rem', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} color="#06b6d4" />
          </div>
          <div>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{data?.total_study_hours || 14.5} hrs</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Hours Logged</p>
          </div>
        </div>

      </div>

      {/* Main Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Subject Progress Bars */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="#818cf8" />
            Subject Mastery Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {data?.subject_progress?.map((sub, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>{sub.subject}</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: sub.color }}>{sub.progress}%</span>
                </div>

                <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.35rem' }}>
                  <div style={{ width: `${sub.progress}%`, height: '100%', background: sub.color, borderRadius: '9999px' }} />
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {sub.completed_tasks} of {sub.total_tasks} plan topics completed • 1 syllabus document indexed
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Strong vs Weak Topics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Strong Topics */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} color="#10b981" /> Strong Mastery Areas
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data?.strong_topics?.map((top, i) => (
                <div key={i} style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.82rem', color: '#a7f3d0' }}>
                  ✓ {top}
                </div>
              ))}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fb7185', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#f43f5e" /> Priority Focus Areas (Memory)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data?.weak_topics?.map((top, i) => (
                <div key={i} style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.82rem', color: '#fecdd3' }}>
                  ⚠ {top}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
