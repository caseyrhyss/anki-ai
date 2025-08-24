'use client';

import React, { useState } from 'react';
import { Brain, Download, Trash2, Edit, Save, X, Plus, Play, Package } from 'lucide-react';
import FlashcardReview from './FlashcardReview';

interface AnkiCard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}

interface AnkiCardGeneratorProps {
  cards: AnkiCard[];
  filename?: string;
  deckId?: string;
  onCardsChange: (cards: AnkiCard[]) => void;
}

export default function AnkiCardGenerator({ cards, filename, deckId, onCardsChange }: AnkiCardGeneratorProps) {
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editedFront, setEditedFront] = useState('');
  const [editedBack, setEditedBack] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [deckName, setDeckName] = useState(filename?.replace('.csv', '') || 'My Anki Deck');

  const updateCards = (newCards: AnkiCard[]) => {
    onCardsChange(newCards);
  };

  const startEditing = (card: AnkiCard) => {
    setEditingCard(card.id);
    setEditedFront(card.front);
    setEditedBack(card.back);
  };

  const saveEdit = () => {
    if (!editingCard) return;
    
    const updatedCards = cards.map(card => 
      card.id === editingCard 
        ? { ...card, front: editedFront, back: editedBack }
        : card
    );
    updateCards(updatedCards);
    setEditingCard(null);
    setEditedFront('');
    setEditedBack('');
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setEditedFront('');
    setEditedBack('');
  };

  const deleteCard = (cardId: string) => {
    const updatedCards = cards.filter(card => card.id !== cardId);
    updateCards(updatedCards);
  };

  const addNewCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;
    
    const newCard: AnkiCard = {
      id: Date.now().toString(),
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      tags: [deckName]
    };
    
    updateCards([...cards, newCard]);
    setNewCardFront('');
    setNewCardBack('');
    setShowAddCard(false);
  };

  const exportCards = async (format: 'csv' | 'json' | 'anki') => {
    try {
      const response = await fetch('/api/export-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards, format, filename: deckName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export cards');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deckName || 'anki-cards'}.${format === 'anki' ? 'txt' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const exportForAnki = async () => {
    try {
      const response = await fetch('/api/export-apkg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards, deckName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export for Anki import');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deckName}_anki_import.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Anki Cards ({cards.length})
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <label className="text-sm font-medium text-gray-700">Deck Name:</label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="px-3 py-2 text-sm border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  placeholder="Enter deck name"
                />
              </div>
            </div>
          </div>
          
          {cards.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowReview(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>Start Review</span>
              </button>
              <button
                onClick={() => setShowAddCard(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Card</span>
              </button>
              <button
                onClick={exportForAnki}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Package className="h-4 w-4" />
                <span>Export for Anki</span>
              </button>
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-10">
                  <button
                    onClick={() => exportCards('csv')}
                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportCards('json')}
                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => exportCards('anki')}
                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    Export for Anki Import
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}



        {/* Add New Card Form */}
        {showAddCard && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Add New Card</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Front (Question)
                </label>
                <textarea
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                  rows={2}
                  placeholder="Enter the question or prompt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Back (Answer)
                </label>
                <textarea
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                  rows={3}
                  placeholder="Enter the answer or explanation"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={addNewCard}
                  disabled={!newCardFront.trim() || !newCardBack.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  Add Card
                </button>
                <button
                  onClick={() => {
                    setShowAddCard(false);
                    setNewCardFront('');
                    setNewCardBack('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        {cards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {editingCard === card.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Front
                      </label>
                      <textarea
                        value={editedFront}
                        onChange={(e) => setEditedFront(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Back
                      </label>
                      <textarea
                        value={editedBack}
                        onChange={(e) => setEditedBack(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={saveEdit}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-800 text-sm mb-2">Front:</h4>
                      <p className="text-gray-700 text-sm">{card.front}</p>
                    </div>
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-800 text-sm mb-2">Back:</h4>
                      <p className="text-gray-700 text-sm">{card.back}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(card)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="h-3 w-3" />
                        <span className="text-xs">Edit</span>
                      </button>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="text-xs">Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Brain className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No cards imported yet
            </h3>
            <p className="text-gray-500">
              Import a CSV file with your flashcard data to get started
            </p>
          </div>
        )}

        {/* Flashcard Review Modal */}
        {showReview && deckId && (
          <FlashcardReview 
            deckId={deckId}
            onClose={() => setShowReview(false)}
            onUpdate={() => {
              // Refresh the cards after review
              if (onCardsChange) {
                onCardsChange(cards);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
