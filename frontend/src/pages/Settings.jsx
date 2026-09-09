import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Key, User, Shield, RefreshCw } from 'lucide-react';

export default function Settings() {
  const [fullName, setFullName] = useState('Alex Student');
  const [targetExam, setTargetExam] = useState('Computer Science Semester Finals');
  const [examDate, setExamDate] = useState('2026-10-15');
  const [hours, setHours] = useState('3.0');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <SettingsIcon size={26} color="#818cf8" />
          Settings & Agent Configuration
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage your AI model keys, learning profile preferences, and system storage.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Student Profile Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#818cf8" /> Student Learning Profile
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.65rem', borderRadius: '0.65rem', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Target Exam Name</label>
              <input type="text" value={targetExam} onChange={(e) => setTargetExam(e.target.value)} style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.65rem', borderRadius: '0.65rem', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Target Exam Date</label>
              <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.65rem', borderRadius: '0.65rem', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Available Study Hours / Day</label>
              <input type="number" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.65rem', borderRadius: '0.65rem', outline: 'none' }} />
            </div>
          </div>
        </div>

        {/* AI Key Configuration Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} color="#06b6d4" /> AI Model & Engine Key
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>API Key (Optional OpenAI / Gemini / Groq Key)</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.65rem', borderRadius: '0.65rem', outline: 'none' }} />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Note: The app includes a fully functional local RAG & Agent engine that runs 100% offline even without an API key!
            </p>
          </div>
        </div>

        <button className="btn-primary" type="submit" style={{ justifyContent: 'center', padding: '0.85rem' }}>
          <Save size={18} /> {saved ? 'Settings Saved Successfully!' : 'Save Preferences'}
        </button>

      </form>
    </div>
  );
}
