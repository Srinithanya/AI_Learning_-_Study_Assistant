import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Bot, 
  Calendar, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { api } from '../api';

export default function Dashboard({ setActiveTab }) {
  const [progress, setProgress] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [progData, docData, planData, quizData] = await Promise.all([
          api.getProgress().catch(() => null),
          api.listDocuments().catch(() => []),
          api.listStudyPlans().catch(() => []),
          api.getAttemptHistory().catch(() => [])
        ]);
        if (progData) setProgress(progData);
        setDocuments(docData || []);
        setPlans(planData || []);
        setQuizzes(quizData || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const activePlan = plans.length > 0 ? plans[0] : null;

  const handleToggleTask = async (taskId) => {
    try {
      await api.toggleTask(taskId);
      const updatedPlans = await api.listStudyPlans();
      setPlans(updatedPlans);
    } catch (err) {
      console.error('Task toggle error:', err);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Welcome Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '1.25rem',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 1, maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', marginBottom: '0.75rem' }}>
            <Sparkles size={14} color="#818cf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c7d2fe' }}>AI-POWERED STUDY ASSISTANT</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Welcome back, Alex! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Your CS Semester Finals are in <strong style={{ color: '#06b6d4' }}>36 days</strong>. You are currently <strong style={{ color: '#10b981' }}>{progress?.overall_completion_percentage || 72.5}%</strong> prepared. Keep up your 5-day study streak!
          </p>
        </div>

        {/* Action Quick Launchers */}
        <div style={{ display: 'flex', gap: '0.75rem', zIndex: 1 }}>
          <button className="btn-primary" onClick={() => setActiveTab('tutor')}>
            <Bot size={18} />
            <span>Ask AI Tutor</span>
          </button>
          <button className="btn-secondary" onClick={() => setActiveTab('materials')}>
            <Upload size={18} />
            <span>Upload Notes</span>
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { title: 'Upload Material', desc: 'PDF, DOCX, PPTX, TXT', icon: Upload, color: '#6366f1', tab: 'materials' },
          { title: 'Ask AI Tutor', desc: 'RAG Answer + Sources', icon: Bot, color: '#06b6d4', tab: 'tutor' },
          { title: 'Create Study Plan', desc: 'Personalized 7-Day Plan', icon: Calendar, color: '#10b981', tab: 'study-plans' },
          { title: 'Generate Quiz', desc: 'MCQs & Practice Tests', icon: HelpCircle, color: '#f59e0b', tab: 'quizzes' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="glass-card" 
              onClick={() => setActiveTab(item.tab)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '0.85rem',
                background: `${item.color}20`,
                border: `1px solid ${item.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={24} color={item.color} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{item.title}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Today's Plan + Progress & Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left Column: Today's Study Plan */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.15)' }}>
                <Calendar size={20} color="#10b981" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  {activePlan ? activePlan.title : "Today's Study Schedule"}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Track daily theory and practice goals</p>
              </div>
            </div>
            <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => setActiveTab('study-plans')}>
              View Full Plan <ArrowRight size={14} />
            </button>
          </div>

          {/* Task List */}
          {activePlan && activePlan.tasks ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activePlan.tasks.slice(0, 4).map((task) => (
                <div 
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.75rem',
                    background: task.is_completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: task.is_completed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <button 
                      onClick={() => handleToggleTask(task.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <CheckCircle2 size={20} color={task.is_completed ? '#10b981' : '#6b7280'} />
                    </button>
                    <div>
                      <p style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        color: task.is_completed ? 'var(--text-muted)' : '#ffffff',
                        textDecoration: task.is_completed ? 'line-through' : 'none'
                      }}>
                        Day {task.day_number}: {task.topic}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.subtopics}</p>
                    </div>
                  </div>
                  <span className="badge badge-indigo">{task.duration_minutes} mins</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No active plan yet. Click 'Create Study Plan' to generate one!</p>
          )}
        </div>

        {/* Right Column: Overall Progress & Weak Topic Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Readiness Gauge */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#06b6d4" />
              Exam Readiness Progress
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Overall Mastered</span>
                <strong style={{ color: '#10b981' }}>{progress?.overall_completion_percentage || 72.5}%</strong>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${progress?.overall_completion_percentage || 72.5}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)', borderRadius: '9999px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>{progress?.total_study_hours || 14.5} hrs</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Study Hours</p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>{progress?.average_quiz_score || 82}%</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avg Quiz Score</p>
              </div>
            </div>
          </div>

          {/* Weak Topics Warning Alert */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '1rem',
            padding: '1.15rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={18} color="#f59e0b" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24' }}>Memory Alert: Focus Areas</h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#fef3c7', marginBottom: '0.75rem' }}>
              AI Memory identified <strong>Subnetting</strong> & <strong>Deadlock Conditions</strong> as your weakest concepts.
            </p>
            <button 
              className="btn-secondary" 
              style={{ width: '100%', fontSize: '0.78rem', padding: '0.4rem', justifyContent: 'center', borderColor: 'rgba(245, 158, 11, 0.3)' }}
              onClick={() => setActiveTab('quizzes')}
            >
              Generate Practice Quiz on Weak Topics
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Row: Recently Uploaded Materials & Recommended Topics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Recently Uploaded Materials */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="#818cf8" />
              Recently Uploaded Course Materials
            </h3>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => setActiveTab('materials')}>
              View All ({documents.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {documents.slice(0, 3).map((doc) => (
              <div 
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.65rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{doc.filename}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{doc.subject} • {doc.chunk_count} vector chunks indexed</p>
                </div>
                <span className="badge badge-emerald">Ready</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Topics */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={18} color="#a855f7" />
            AI Recommended Next Steps
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              "Review 4 Coffman Deadlock Conditions (OS Unit 2)",
              "Solve 5 Subnet Masking Practice Problems (CN Unit 3)",
              "Study Binary Search Tree Time Complexity (DS Unit 3)"
            ].map((rec, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '0.65rem', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }} />
                <p style={{ fontSize: '0.82rem', color: '#e9d5ff', fontWeight: 500 }}>{rec}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
