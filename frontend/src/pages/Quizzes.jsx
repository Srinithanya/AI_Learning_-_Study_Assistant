import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, CheckCircle, XCircle, Award, BookOpen, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { api } from '../api';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Quiz taking state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Generator State
  const [subject, setSubject] = useState('Operating Systems');
  const [topic, setTopic] = useState('Deadlock');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [qType, setQType] = useState('Multiple Choice');
  const [generating, setGenerating] = useState(false);

  const loadQuizzesAndHistory = async () => {
    try {
      const [quizData, attemptData] = await Promise.all([
        api.listQuizzes().catch(() => []),
        api.getAttemptHistory().catch(() => [])
      ]);
      setQuizzes(quizData || []);
      setAttempts(attemptData || []);
    } catch (err) {
      console.error('Failed to load quiz data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzesAndHistory();
  }, []);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const newQuiz = await api.generateQuiz({
        subject,
        topic,
        num_questions: numQuestions,
        difficulty,
        question_type: qType
      });
      setActiveQuiz(newQuiz);
      setUserAnswers({});
      setQuizResult(null);
      await loadQuizzesAndHistory();
    } catch (err) {
      alert(`Quiz generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId, optionText) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionText }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      const result = await api.submitQuiz(activeQuiz.id, userAnswers);
      setQuizResult(result);
      await loadQuizzesAndHistory();
    } catch (err) {
      alert(`Submit quiz failed: ${err.message}`);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <HelpCircle size={26} color="#f59e0b" />
            AI RAG Quiz Generator & Assessor
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Quizzes are generated directly from your uploaded course materials. Weak topics are automatically saved to AI Memory.
          </p>
        </div>
      </div>

      {/* Active Quiz Player Screen */}
      {activeQuiz && !quizResult && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
            <div>
              <span className="badge badge-amber" style={{ marginBottom: '0.35rem' }}>Active Quiz Session</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>{activeQuiz.subject} - {activeQuiz.topic}</h2>
            </div>
            <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => setActiveQuiz(null)}>
              Exit Quiz
            </button>
          </div>

          {/* Question List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '2rem' }}>
            {activeQuiz.questions.map((qn, idx) => (
              <div key={qn.id} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.85rem', padding: '1.25rem' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
                  <span style={{ color: '#f59e0b', marginRight: '0.5rem' }}>Q{idx + 1}.</span> {qn.question_text}
                </p>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {qn.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[qn.id] === opt;
                    return (
                      <label 
                        key={optIdx}
                        onClick={() => handleSelectOption(qn.id, opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.65rem',
                          background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.06)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.88rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`q_${qn.id}`} 
                          checked={isSelected} 
                          onChange={() => {}} 
                          style={{ accentColor: '#f59e0b' }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }} onClick={handleSubmitQuiz}>
            <CheckCircle size={20} /> Submit Answers & View Performance Report
          </button>
        </div>
      )}

      {/* Quiz Results Feedback Report Screen */}
      {quizResult && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: quizResult.percentage >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', border: quizResult.percentage >= 80 ? '2px solid #10b981' : '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Award size={36} color={quizResult.percentage >= 80 ? '#10b981' : '#f59e0b'} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              Score: {quizResult.score} / {quizResult.total_questions} ({quizResult.percentage}%)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              {quizResult.performance_analysis}
            </p>
          </div>

          {/* Weak Topics Warning */}
          {quizResult.weak_topics && quizResult.weak_topics.length > 0 && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '0.85rem', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#fb7185" />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fb7185' }}>Saved to Memory Profile: Weak Topics Flagged</h4>
                <p style={{ fontSize: '0.78rem', color: '#fecdd3' }}>{quizResult.weak_topics.join(', ')} has been added to your memory so future study plans will prioritize them.</p>
              </div>
            </div>
          )}

          {/* Detailed Question Review */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>Detailed Answer Explanations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {quizResult.detailed_feedback.map((fb, idx) => (
              <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.8)', border: fb.is_correct ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {fb.is_correct ? <CheckCircle size={18} color="#10b981" /> : <XCircle size={18} color="#fb7185" />}
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Q{idx + 1}. {fb.question}</span>
                </div>

                <div style={{ fontSize: '0.82rem', marginLeft: '1.6rem' }}>
                  <p style={{ color: fb.is_correct ? '#34d399' : '#fb7185' }}>Your Answer: {fb.user_answer}</p>
                  {!fb.is_correct && <p style={{ color: '#34d399' }}>Correct Answer: {fb.correct_answer}</p>}
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>Explanation: {fb.explanation}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setQuizResult(null)}>
            <RotateCcw size={16} /> Back to Quiz Generator
          </button>
        </div>
      )}

      {/* Generator Form + Past Attempts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Generator Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#f59e0b" />
            Generate New Quiz
          </h3>

          <form onSubmit={handleGenerateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }}>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Data Structures">Data Structures</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Specific Topic</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Deadlock, Subnetting, OSI Model" style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard (Exam Level)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Questions Count</label>
                <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} style={{ width: '100%', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', padding: '0.55rem', borderRadius: '0.65rem', outline: 'none' }}>
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', marginTop: '0.5rem', justifyContent: 'center' }} type="submit" disabled={generating}>
              <Sparkles size={16} /> {generating ? 'Generating Quiz from RAG...' : 'Generate & Start Quiz'}
            </button>
          </form>
        </div>

        {/* Past Attempts History */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#10b981" />
            Quiz History & Performance
          </h3>

          {attempts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No quizzes attempted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {attempts.map((att) => (
                <div key={att.attempt_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '0.65rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>{att.subject} ({att.topic})</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{att.completed_at}</p>
                  </div>
                  <span className={`badge ${att.percentage >= 80 ? 'badge-emerald' : 'badge-amber'}`}>
                    {att.score}/{att.total_questions} ({att.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
