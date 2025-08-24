'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Calendar, FileText, Trash2, Edit, Plus } from 'lucide-react';

interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    cards: number;
  };
}

interface DeckListProps {
  onSelectDeck: (deck: Deck) => void;
  refreshTrigger?: number;
}

export default function DeckList({ onSelectDeck, refreshTrigger }: DeckListProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/decks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }
      
      const data = await response.json();
      setDecks(data);
      setError('');
    } catch (err) {
      console.error('Error fetching decks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [refreshTrigger]);

  const deleteDeck = async (deckId: string, deckName: string) => {
    if (!confirm(`Are you sure you want to delete the deck "${deckName}"? This will also delete all cards in the deck.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deck');
      }

      // Refresh the deck list
      fetchDecks();
    } catch (err) {
      console.error('Error deleting deck:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete deck');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading decks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Your Decks ({decks.length})
          </h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No decks yet
          </h3>
          <p className="text-gray-500">
            Import a CSV file to create your first deck!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <div key={deck.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800 truncate flex-1">
                  {deck.name}
                </h3>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => onSelectDeck(deck)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Open deck"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteDeck(deck.id, deck.name)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete deck"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {deck.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {deck.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{deck._count.cards} cards</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(deck.updatedAt)}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectDeck(deck)}
                className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Open Deck
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
