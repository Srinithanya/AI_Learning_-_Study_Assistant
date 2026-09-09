import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle2, Clock, Trash2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { api } from '../api';

export default function StudyPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [subject, setSubject] = useState('Operating Systems');
  const [durationDays, setDurationDays] = useState(7);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [hours, setHours] = useState(2.5);

  const loadPlans = async () => {
    try {
      const data = await api.listStudyPlans();
      setPlans(data || []);
    } catch (err) {
      console.error('Failed to load study plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.generateStudyPlan({
        subject,
        duration_days: durationDays,
        current_knowledge: difficulty,
        available_hours: hours
      });
      setShowGenerator(false);
      await loadPlans();
    } catch (err) {
      alert(`Failed to generate plan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await api.toggleTask(taskId);
      await loadPlans();
    } catch (err) {
      console.error('Toggle task error:', err);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Delete this study plan?')) return;
    try {
      await api.deletePlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Calendar size={26} color="#10b981" />
            Personalized AI Study Planner
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            AI analyzes your syllabus materials & Memory profile to structure day-by-day learning schedules.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowGenerator(!showGenerator)}>
          <Plus size={18} />
          <span>{showGenerator ? 'Close Generator' : 'Generate New Plan'}</span>
        </button>
      </div>

      {/* Generator Form Drawer */}
      {showGenerator && (
        <form className="glass-card animate-fade-in" onSubmit={handleGeneratePlan} style={{ marginBottom: '2rem', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#818cf8" />
            Create AI Study Schedule
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Target Subject</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }}
              >
                <option value="Operating Systems">Operating Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Database Systems">Database Systems</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Plan Duration</label>
              <select 
                value={durationDays} 
                onChange={(e) => setDurationDays(Number(e.target.value))}
                style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }}
              >
                <option value={5}>5-Day Intensive Plan</option>
                <option value={7}>7-Day Complete Plan</option>
                <option value={14}>14-Day Exam Prep</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Current Knowledge</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }}
              >
                <option value="Beginner">Beginner (Concept Heavy)</option>
                <option value="Intermediate">Intermediate (Theory + Practice)</option>
                <option value="Advanced">Advanced (Problem Solving)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Hours Per Day</label>
              <input 
                type="number" 
                step="0.5"
                value={hours} 
                onChange={(e) => setHours(Number(e.target.value))}
                style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }}
              />
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            <Sparkles size={16} /> Generate Personalized Plan
          </button>
        </form>
      )}

      {/* Active Plans Display */}
      {plans.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No study plans created yet. Click 'Generate New Plan' to build one!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {plans.map((plan) => (
            <div key={plan.id} className="glass-card">
              
              {/* Plan Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>{plan.title}</h2>
                    <span className="badge badge-emerald">{plan.status}</span>
                    <span className="badge badge-indigo">{plan.difficulty}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Subject: {plan.subject} • {plan.duration_days} Days Scheduled
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {/* Progress Gauge */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>{plan.completion_percentage}%</span>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Completed</p>
                  </div>
                  <button onClick={() => handleDeletePlan(plan.id)} style={{ background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{ width: `${plan.completion_percentage}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: '9999px' }} />
              </div>

              {/* Task Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {plan.tasks.map((task) => (
                  <div 
                    key={task.id}
                    style={{
                      background: task.is_completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: task.is_completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '0.85rem',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <button 
                        onClick={() => handleToggleTask(task.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '0.15rem' }}
                      >
                        <CheckCircle2 size={22} color={task.is_completed ? '#10b981' : '#6b7280'} />
                      </button>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>Day {task.day_number}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {task.activity_type}</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: task.is_completed ? 'var(--text-muted)' : '#ffffff', textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                          {task.topic}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{task.subtopics}</p>
                      </div>
                    </div>

                    <span className="badge badge-indigo" style={{ flexShrink: 0 }}>
                      <Clock size={12} style={{ marginRight: '0.25rem' }} /> {task.duration_minutes}m
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
