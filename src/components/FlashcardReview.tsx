'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Eye, EyeOff, Brain, X } from 'lucide-react';

interface AnkiCard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
  interval?: number;
  repetitions?: number;
  easeFactor?: number;
  nextReviewDate?: string;
  lastReviewed?: string;
  reviewCount?: number;
  isNew?: boolean;
  isOverdue?: boolean;
  timeDisplay?: string;
}

interface FlashcardReviewProps {
  deckId: string;
  onClose: () => void;
  onUpdate: () => void;
}

type DifficultyLevel = 'again' | 'hard' | 'good' | 'easy';

interface ReviewSession {
  startTime: Date;
  cardStartTime: Date;
  totalCards: number;
  reviewedCards: number;
  correctCards: number;
}

export default function FlashcardReview({ deckId, onClose, onUpdate }: FlashcardReviewProps) {
  const [cards, setCards] = useState<AnkiCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewComplete, setReviewComplete] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load cards due for review
  useEffect(() => {
    loadDueCards();
  }, [deckId]);

  // Real-time timer update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadDueCards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/decks/${deckId}/due-cards?includeNew=true`);
      
      if (!response.ok) {
        throw new Error('Failed to load cards');
      }

      const data = await response.json();
      
      if (data.cards.length === 0) {
        setReviewComplete(true);
        return;
      }

      setCards(data.cards);
      setSession({
        startTime: new Date(),
        cardStartTime: new Date(),
        totalCards: data.cards.length,
        reviewedCards: 0,
        correctCards: 0
      });
      setError('');
    } catch (err) {
      console.error('Error loading due cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;
  const isFirstCard = currentIndex === 0;

  const handleNext = () => {
    if (!isLastCard) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      // Update card start time for response time tracking
      if (session) {
        setSession({
          ...session,
          cardStartTime: new Date()
        });
      }
    } else {
      setReviewComplete(true);
    }
  };

  const handlePrevious = () => {
    if (!isFirstCard) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      if (session) {
        setSession({
          ...session,
          cardStartTime: new Date()
        });
      }
    }
  };

  const handleDifficultySelect = async (difficulty: DifficultyLevel) => {
    if (!session || !currentCard) return;

    const responseTime = Math.floor((new Date().getTime() - session.cardStartTime.getTime()) / 1000);
    
    try {
      // Record the review
      const response = await fetch(`/api/cards/${currentCard.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty,
          responseTime,
          totalCards: session.totalCards
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record review');
      }

      const result = await response.json();

      // Update session stats
      const newCorrectCards = ['good', 'easy'].includes(difficulty) 
        ? session.correctCards + 1 
        : session.correctCards;

      setSession({
        ...session,
        reviewedCards: session.reviewedCards + 1,
        correctCards: newCorrectCards,
        cardStartTime: new Date()
      });

      // Show feedback briefly before moving to next card
      setTimeout(() => {
        if (difficulty === 'again') {
          // For 'again', add card back to the end of current session
          const updatedCards = [...cards];
          const cardToRepeat = { ...currentCard };
          updatedCards.push(cardToRepeat);
          setCards(updatedCards);
        }
        
        if (isLastCard || session.reviewedCards + 1 >= session.totalCards) {
          setReviewComplete(true);
          onUpdate(); // Notify parent to refresh
        } else {
          handleNext();
        }
      }, 800);

    } catch (err) {
      console.error('Error recording review:', err);
      setError('Failed to record review. Please try again.');
    }
  };

  const formatElapsedTime = (startTime: Date) => {
    const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetReview = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setReviewComplete(false);
    loadDueCards();
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'again': return 'bg-red-500 hover:bg-red-600';
      case 'hard': return 'bg-orange-500 hover:bg-orange-600';
      case 'good': return 'bg-green-500 hover:bg-green-600';
      case 'easy': return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getDifficultyTime = (difficulty: DifficultyLevel) => {
    if (!session) return '';
    
    // Estimate time based on current deck size and algorithm (match API)
    const scaleFactor = Math.min(2, 1 + (session.totalCards / 50));
    
    switch (difficulty) {
      case 'again': return `~${Math.floor(3 * scaleFactor)} min`;
      case 'hard': return `~${Math.floor(6 * scaleFactor)} min`;
      case 'good': return `~${Math.floor(10 * scaleFactor)} min`;
      case 'easy': return `~${Math.floor(15 * scaleFactor)} min`;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Loading Review Session...
            </h3>
            <p className="text-gray-500">
              Preparing your cards based on spaced repetition
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <div className="space-x-2">
              <button
                onClick={resetReview}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reviewComplete || cards.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <Brain className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {cards.length === 0 ? 'No cards due for review!' : 'Review session complete!'}
            </h3>
            <p className="text-gray-500 mb-4">
              {cards.length === 0 
                ? 'All cards are scheduled for future review based on your performance.'
                : session 
                ? `You reviewed ${session.reviewedCards} cards with ${Math.round((session.correctCards / session.reviewedCards) * 100)}% accuracy in ${formatElapsedTime(session.startTime)}.`
                : 'Great job studying!'
              }
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold truncate">Flashcard Review</h2>
                <div className="text-purple-100 text-xs sm:text-sm space-y-1">
                  <p className="font-medium">Card {currentIndex + 1} of {cards.length}</p>
                  {session && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <span>Reviewed: {session.reviewedCards}</span>
                      <span>Accuracy: {session.reviewedCards > 0 ? Math.round((session.correctCards / session.reviewedCards) * 100) : 0}%</span>
                      <span>Time: {formatElapsedTime(session.startTime)}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {currentCard?.isNew && <span className="inline-flex items-center px-2 py-1 bg-yellow-200 bg-opacity-80 text-yellow-800 text-xs font-medium rounded-full">★ New</span>}
                    {currentCard?.isOverdue && <span className="inline-flex items-center px-2 py-1 bg-red-200 bg-opacity-80 text-red-800 text-xs font-medium rounded-full">⏰ Overdue</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 self-start sm:self-center">
              <button
                onClick={resetReview}
                className="p-2 sm:p-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl transition-all duration-200 border-2 border-white shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Reset review"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-2 sm:p-3 bg-red-500 bg-opacity-90 rounded-xl hover:bg-red-600 hover:bg-opacity-100 transition-all duration-200 border-2 border-white shadow-lg"
                title="Close review"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-white font-bold" />
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 sm:mt-6 bg-white bg-opacity-20 rounded-full h-2 sm:h-3">
            <div
              className="bg-white rounded-full h-2 sm:h-3 transition-all duration-500 shadow-sm"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            {/* Question/Answer Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg min-h-[300px] flex flex-col justify-center">
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {showAnswer ? 'Answer' : 'Question'}
                  </h3>
                  <div className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                    {showAnswer ? currentCard.back : currentCard.front}
                  </div>
                </div>

                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Eye className="h-5 w-5" />
                    <span>Show Answer</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-gray-500 mb-4">
                      <EyeOff className="h-4 w-4" />
                      <span className="text-sm">How difficult was this card?</span>
                    </div>
                    
                    {/* Difficulty Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        onClick={() => handleDifficultySelect('again')}
                        className={`${getDifficultyColor('again')} text-white p-4 rounded-xl transition-colors shadow-lg`}
                      >
                        <div className="font-medium">Again</div>
                        <div className="text-sm opacity-90">{getDifficultyTime('again')}</div>
                      </button>
                      <button
                        onClick={() => handleDifficultySelect('hard')}
                        className={`${getDifficultyColor('hard')} text-white p-4 rounded-xl transition-colors shadow-lg`}
                      >
                        <div className="font-medium">Hard</div>
                        <div className="text-sm opacity-90">{getDifficultyTime('hard')}</div>
                      </button>
                      <button
                        onClick={() => handleDifficultySelect('good')}
                        className={`${getDifficultyColor('good')} text-white p-4 rounded-xl transition-colors shadow-lg`}
                      >
                        <div className="font-medium">Good</div>
                        <div className="text-sm opacity-90">{getDifficultyTime('good')}</div>
                      </button>
                      <button
                        onClick={() => handleDifficultySelect('easy')}
                        className={`${getDifficultyColor('easy')} text-white p-4 rounded-xl transition-colors shadow-lg`}
                      >
                        <div className="font-medium">Easy</div>
                        <div className="text-sm opacity-90">{getDifficultyTime('easy')}</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={isFirstCard}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-500">
                {showAnswer ? 'How well did you remember this card?' : 'Think about the answer, then reveal'}
              </div>
              {showAnswer && (
                <div className="text-xs text-gray-400 mt-1">
                  Times are estimated based on spaced repetition algorithm
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={isLastCard || !showAnswer}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
