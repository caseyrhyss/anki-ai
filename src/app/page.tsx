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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Anki Card Manager
          </h1>
          <p className="text-lg text-gray-600">
            Import CSV files, store decks in database, and export for Anki
          </p>
          
          {/* Navigation */}
          {!selectedDeck && (
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() => setView('decks')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  view === 'decks'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                My Decks
              </button>
              <button
                onClick={() => setView('import')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  view === 'import'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Import CSV
              </button>
            </div>
          )}
        </header>
        
        <div className="space-y-8">
          {selectedDeck ? (
            <div>
              <div className="mb-4">
                <button
                  onClick={handleBackToDecks}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Back to Decks
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
            <CSVUpload onDeckCreated={handleDeckCreated} />
          ) : (
            <DeckList 
              onSelectDeck={handleSelectDeck}
              refreshTrigger={refreshTrigger}
            />
          )}
        </div>
      </div>
    </main>
  );
}