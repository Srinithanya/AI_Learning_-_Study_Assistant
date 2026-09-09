import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import AITutor from './pages/AITutor';
import MyMaterials from './pages/MyMaterials';
import StudyPlans from './pages/StudyPlans';
import Quizzes from './pages/Quizzes';
import Flashcards from './pages/Flashcards';
import Progress from './pages/Progress';
import LearningMemory from './pages/LearningMemory';
import Settings from './pages/Settings';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [memoryCount, setMemoryCount] = useState(3);
  const [docCount, setDocCount] = useState(3);

  useEffect(() => {
    async function loadInitialMeta() {
      try {
        const [me, mems, docs] = await Promise.all([
          api.getMe().catch(() => null),
          api.listMemories().catch(() => []),
          api.listDocuments().catch(() => [])
        ]);
        if (me) setUser(me);
        if (mems) setMemoryCount(mems.length);
        if (docs) setDocCount(docs.length);
      } catch (err) {
        console.error('Initial meta fetch error:', err);
      }
    }
    loadInitialMeta();
  }, [activeTab]);

  return (
    <div className="app-container">
      {/* Background Orbs */}
      <div className="glow-bg">
        <div className="glow-orb-1" />
        <div className="glow-orb-2" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Workspace */}
      <div className="main-content">
        <Header 
          user={user} 
          memoryCount={memoryCount} 
          docCount={docCount} 
          onSearchClick={() => setActiveTab('tutor')} 
        />

        <main style={{ flex: 1, paddingBottom: '3rem' }}>
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'tutor' && <AITutor />}
          {activeTab === 'materials' && <MyMaterials />}
          {activeTab === 'study-plans' && <StudyPlans />}
          {activeTab === 'quizzes' && <Quizzes />}
          {activeTab === 'flashcards' && <Flashcards />}
          {activeTab === 'progress' && <Progress />}
          {activeTab === 'memory' && <LearningMemory />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}
