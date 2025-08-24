'use client';

import { useState } from 'react';
import CSVUpload from '@/components/CSVUpload';
import DeckList from '@/components/DeckList';
import AnkiCardGenerator from '@/components/AnkiCardGenerator';

interface AnkiCard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}

interface DeckSummary {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    cards: number;
  };
}

interface FullDeck extends DeckSummary {
  cards: AnkiCard[];
}

export default function Home() {
  const [selectedDeck, setSelectedDeck] = useState<FullDeck | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [view, setView] = useState<'decks' | 'import'>('decks');

  const handleDeckCreated = (deckId: string) => {
    // Refresh the deck list and switch to deck view
    setRefreshTrigger(prev => prev + 1);
    setView('decks');
  };

  const handleSelectDeck = async (deck: DeckSummary) => {
    try {
      // Fetch full deck data with cards
      const response = await fetch(`/api/decks/${deck.id}`);
      if (response.ok) {
        const fullDeck = await response.json();
        setSelectedDeck(fullDeck);
      }
    } catch (error) {
      console.error('Error loading deck:', error);
    }
  };

  const handleCardsChange = async (updatedCards: AnkiCard[]) => {
    if (!selectedDeck) return;

    try {
      // Update cards in database
      const response = await fetch(`/api/decks/${selectedDeck.id}/cards`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards: updatedCards }),
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedDeck(result.deck);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating cards:', error);
    }
  };

  const handleBackToDecks = () => {
    setSelectedDeck(null);
    setView('decks');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 px-3 py-4 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Anki Card Manager
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Import CSV files, store decks in database, and export for Anki with intelligent spaced repetition
            </p>
          </div>
          
          {/* Navigation */}
          {!selectedDeck && (
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={() => setView('decks')}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  view === 'decks'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  📚 My Decks
                </span>
              </button>
              <button
                onClick={() => setView('import')}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  view === 'import'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  📥 Import CSV
                </span>
              </button>
            </div>
          )}
        </header>
        
        <div className="space-y-6 sm:space-y-8">
          {selectedDeck ? (
            <div className="w-full">
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={handleBackToDecks}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  <span>←</span>
                  <span className="hidden sm:inline">Back to Decks</span>
                  <span className="sm:hidden">Back</span>
                </button>
              </div>
              <AnkiCardGenerator 
                cards={selectedDeck.cards}
                filename={selectedDeck.name}
                deckId={selectedDeck.id}
                onCardsChange={handleCardsChange}
              />
            </div>
          ) : view === 'import' ? (
            <div className="w-full">
              <CSVUpload onDeckCreated={handleDeckCreated} />
            </div>
          ) : (
            <div className="w-full">
              <DeckList 
                onSelectDeck={handleSelectDeck}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}