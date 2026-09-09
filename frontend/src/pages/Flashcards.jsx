import React, { useState, useEffect } from 'react';
import { Layers, RotateCw, CheckCircle, HelpCircle, ChevronLeft, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { api } from '../api';

export default function Flashcards() {
  const [decks, setDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDecks = async () => {
    try {
      const data = await api.listFlashcardDecks();
      setDecks(data || []);
      if (data && data.length > 0) {
        setActiveDeck(data[0]);
      }
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecks();
  }, []);

  const handleNext = () => {
    if (!activeDeck || !activeDeck.cards) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % activeDeck.cards.length);
  };

  const handlePrev = () => {
    if (!activeDeck || !activeDeck.cards) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + activeDeck.cards.length) % activeDeck.cards.length);
  };

  const handleGenerateNewDeck = async () => {
    setLoading(true);
    try {
      await api.generateFlashcards({ subject: 'Operating Systems', num_cards: 6 });
      await loadDecks();
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = activeDeck?.cards?.[currentIndex];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Layers size={26} color="#a855f7" />
            AI RAG Flashcards
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Interactive 3D flashcard decks derived from your uploaded course notes. Click card to flip!
          </p>
        </div>

        <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }} onClick={handleGenerateNewDeck}>
          <Sparkles size={18} /> Generate Deck
        </button>
      </div>

      {/* Main Flashcard Studio */}
      {activeDeck && currentCard ? (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          
          {/* Deck Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => { setActiveDeck(deck); setCurrentIndex(0); setIsFlipped(false); }}
                className={activeDeck.id === deck.id ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', whiteSpace: 'nowrap' }}
              >
                {deck.title}
              </button>
            ))}
          </div>

          {/* Flashcard Stats & Stepper Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Card {currentIndex + 1} of {activeDeck.cards.length}</span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Mastered: {knownCount}</span>
              <span style={{ color: '#fb7185', fontWeight: 600 }}>Needs Review: {reviewCount}</span>
            </div>
          </div>

          {/* 3D Flip Card */}
          <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)} style={{ marginBottom: '1.5rem' }}>
            <div className="flip-card-inner">
              
              {/* Front Side */}
              <div className="flip-card-front">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-indigo">QUESTION / CONCEPT</span>
                  <RotateCw size={16} color="#9ca3af" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.5, margin: 'auto 0' }}>
                  {currentCard.front_prompt}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click anywhere on the card to reveal answer</p>
              </div>

              {/* Back Side */}
              <div className="flip-card-back">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-emerald">EXPLANATION</span>
                  <RotateCw size={16} color="#9ca3af" />
                </div>
                <p style={{ fontSize: '1rem', color: '#f3f4f6', lineHeight: 1.6, margin: 'auto 0', whiteSpace: 'pre-wrap' }}>
                  {currentCard.back_answer}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#93c5fd', fontStyle: 'italic' }}>
                  Source: {currentCard.source_ref || 'Uploaded Course Notes'}
                </p>
              </div>

            </div>
          </div>

          {/* Action & Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn-secondary" onClick={handlePrev}>
              <ChevronLeft size={18} /> Prev
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn-secondary" 
                style={{ borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fb7185' }}
                onClick={() => { setReviewCount(prev => prev + 1); handleNext(); }}
              >
                <HelpCircle size={16} /> Need Practice
              </button>
              <button 
                className="btn-secondary" 
                style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
                onClick={() => { setKnownCount(prev => prev + 1); handleNext(); }}
              >
                <CheckCircle size={16} /> Got It
              </button>
            </div>

            <button className="btn-secondary" onClick={handleNext}>
              Next <ChevronRight size={18} />
            </button>
          </div>

        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No flashcards generated yet.</p>
        </div>
      )}

    </div>
  );
}
