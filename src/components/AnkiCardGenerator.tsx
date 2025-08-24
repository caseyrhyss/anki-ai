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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title and Deck Name */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                  Anki Cards ({cards.length})
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-sm sm:text-base font-semibold text-gray-700 whitespace-nowrap">
                    Deck Name:
                  </label>
                  <input
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                    placeholder="Enter deck name"
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            {cards.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 lg:gap-3">
                <button
                  onClick={() => setShowReview(true)}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Start Review</span>
                </button>
                
                <button
                  onClick={() => setShowAddCard(true)}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Add Card</span>
                </button>
                
                {/* <button
                  onClick={exportForAnki}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Export for Anki</span>
                  <span className="sm:hidden">Export</span>
                </button> */}
                
                {/* Export Dropdown */}
                {/* <div className="relative group">
                  <button className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>More</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 overflow-hidden">
                    <button
                      onClick={() => exportCards('csv')}
                      className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                    >
                      <span className="mr-3">📊</span>
                      Export as CSV
                    </button>
                    <button
                      onClick={() => exportCards('json')}
                      className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium border-t border-gray-100"
                    >
                      <span className="mr-3">📄</span>
                      Export as JSON
                    </button>
                    <button
                      onClick={() => exportCards('anki')}
                      className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium border-t border-gray-100"
                    >
                      <span className="mr-3">🎯</span>
                      Export for Anki Import
                    </button>
                  </div>
                </div> */}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-500 font-bold">⚠️</span>
              </div>
              <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}



        {/* Add New Card Form */}
        {showAddCard && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 border-2 border-green-200 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Add New Card</h3>
            </div>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Front (Question) *
                </label>
                <textarea
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none text-sm sm:text-base transition-all"
                  rows={2}
                  placeholder="Enter the question or prompt"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Back (Answer) *
                </label>
                <textarea
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none text-sm sm:text-base transition-all"
                  rows={3}
                  placeholder="Enter the answer or explanation"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={addNewCard}
                  disabled={!newCardFront.trim() || !newCardBack.trim()}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Card</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddCard(false);
                    setNewCardFront('');
                    setNewCardBack('');
                  }}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        {cards.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div key={card.id} className="border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                {editingCard === card.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="font-bold text-gray-800">Editing Card</h4>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Front
                      </label>
                      <textarea
                        value={editedFront}
                        onChange={(e) => setEditedFront(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none text-sm transition-all"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Back
                      </label>
                      <textarea
                        value={editedBack}
                        onChange={(e) => setEditedBack(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none text-sm transition-all"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={saveEdit}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex-1"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-xs">❓</span>
                        </div>
                        <h4 className="font-bold text-blue-600 text-sm">FRONT</h4>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed bg-blue-50 p-3 rounded-xl border border-blue-200">{card.front}</p>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-bold text-xs">✅</span>
                        </div>
                        <h4 className="font-bold text-green-600 text-sm">BACK</h4>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed bg-green-50 p-3 rounded-xl border border-green-200">{card.back}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(card)}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-blue-100 rounded-3xl mb-6">
              <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-3">
              No cards imported yet
            </h3>
            <p className="text-gray-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
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
