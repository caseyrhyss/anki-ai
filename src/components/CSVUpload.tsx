'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import Papa from 'papaparse';

interface AnkiCard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}

interface CSVUploadProps {
  onDeckCreated: (deckId: string) => void;
}

export default function CSVUpload({ onDeckCreated }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState<AnkiCard[]>([]);
  const [allCards, setAllCards] = useState<AnkiCard[]>([]);
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [readyToSave, setReadyToSave] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (csvFile) {
      setFile(csvFile);
      setError('');
      setSuccess('');
      processCSV(csvFile);
    }
  }, []);

  const processCSV = async (file: File) => {
    setIsProcessing(true);
    setError('');
    setPreview([]);
    
    try {
      const text = await file.text();
      
      Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const cards: AnkiCard[] = [];
            const errors: string[] = [];
            
            results.data.forEach((row, index: number) => {
              const rowNumber = index + 2; // +2 because of 0-index and header row
              
              // Support different column name variations
              const front = row.front || row.Front || row.FRONT || 
                           row.question || row.Question || row.QUESTION ||
                           row.q || row.Q;
              
              const back = row.back || row.Back || row.BACK || 
                          row.answer || row.Answer || row.ANSWER ||
                          row.a || row.A;
              
              const tags = row.tags || row.Tags || row.TAGS || '';
              
              if (!front || !back) {
                errors.push(`Row ${rowNumber}: Missing front or back content`);
                return;
              }
              
              if (front.trim().length === 0 || back.trim().length === 0) {
                errors.push(`Row ${rowNumber}: Empty front or back content`);
                return;
              }
              
              cards.push({
                id: (index + 1).toString(),
                front: front.trim(),
                back: back.trim(),
                tags: tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [file.name.replace('.csv', '')]
              });
            });
            
            if (errors.length > 0) {
              setError(`Found ${errors.length} error(s):\n${errors.join('\n')}`);
            }
            
            if (cards.length === 0) {
              setError('No valid cards found in CSV. Please ensure your CSV has "front" and "back" columns with content.');
              return;
            }
            
            setAllCards(cards); // Store all parsed cards
            setPreview(cards.slice(0, 5)); // Show first 5 cards as preview
            setSuccess(`Successfully parsed ${cards.length} cards from CSV!`);
            setDeckName(file.name.replace('.csv', ''));
            setReadyToSave(true);
            
          } catch (parseError) {
            console.error('CSV parsing error:', parseError);
            setError('Failed to parse CSV content. Please check your file format.');
          }
        },
        error: (error: Error) => {
          console.error('Papa Parse error:', error);
          setError(`CSV parsing failed: ${error.message}`);
        }
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(`Failed to process CSV: ${errorMessage}`);
      console.error('CSV processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setSuccess('');
    setPreview([]);
    setAllCards([]);
    setDeckName('');
    setDeckDescription('');
    setReadyToSave(false);
  };

  const saveToDeck = async () => {
    if (!deckName.trim() || allCards.length === 0) {
      setError('Deck name and cards are required');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: allCards.map(card => ({
            front: card.front,
            back: card.back,
            tags: card.tags
          })),
          deckName: deckName.trim(),
          description: deckDescription.trim() || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save deck');
      }

      const result = await response.json();
      setSuccess(`Successfully created deck "${deckName}" with ${allCards.length} cards!`);
      
      // Call parent callback with deck ID
      if (onDeckCreated && result.deck) {
        onDeckCreated(result.deck.id);
      }

      // Clear form
      setTimeout(() => {
        removeFile();
      }, 2000);

    } catch (err) {
      console.error('Error saving deck:', err);
      setError(err instanceof Error ? err.message : 'Failed to save deck');
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'text/plain': ['.csv']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB limit for CSV files
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl mb-4">
            <span className="text-2xl sm:text-3xl">📥</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">Import CSV Cards</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload a CSV file with your flashcard data. Your CSV should have columns named &quot;front&quot; and &quot;back&quot;.
          </p>
        </div>

        {/* CSV Format Help */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">ℹ️</span>
            </div>
            <h3 className="font-bold text-blue-800 text-lg sm:text-xl">CSV Format Requirements:</h3>
          </div>
          <div className="text-sm sm:text-base text-blue-700 space-y-2 ml-11">
            <p>• <strong>Required columns:</strong> &quot;front&quot; and &quot;back&quot; (or &quot;question&quot;/&quot;answer&quot;)</p>
            <p>• <strong>Optional column:</strong> &quot;tags&quot; (comma-separated)</p>
            <p>• <strong>Example:</strong></p>
            <div className="mt-3 bg-white p-3 sm:p-4 rounded-xl border border-blue-200 font-mono text-xs sm:text-sm overflow-x-auto">
              <div className="whitespace-nowrap">
                front,back,tags<br/>
                &quot;What is the capital of France?&quot;,&quot;Paris&quot;,&quot;geography,capitals&quot;<br/>
                &quot;Define photosynthesis&quot;,&quot;The process by which plants convert light energy to chemical energy&quot;,&quot;biology,plants&quot;
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-3 border-dashed rounded-2xl p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:scale-102'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className={`mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-colors ${
                isDragActive ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Upload className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors ${
                  isDragActive ? 'text-blue-500' : 'text-gray-400'
                }`} />
              </div>
              {isDragActive ? (
                <div>
                  <p className="text-lg sm:text-xl font-semibold text-blue-600 mb-2">Drop your CSV file here!</p>
                  <p className="text-sm text-blue-500">Release to upload</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                    Drag & drop your CSV file here
                  </p>
                  <p className="text-base text-gray-500 mb-3">or click to select from your device</p>
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all">
                    📁 Browse Files
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-3">
                    Supports .csv files up to 50MB
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{file.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • CSV File
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="self-start sm:self-center p-2 sm:p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center space-x-3 text-blue-600 mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="font-medium">Processing CSV file...</span>
              </div>
            )}

            {error && (
              <div className="flex items-start space-x-3 p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-2xl mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-red-700 font-semibold mb-1">Import Error</p>
                  <pre className="text-red-600 text-xs sm:text-sm whitespace-pre-wrap break-words">{error}</pre>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-3 p-4 sm:p-5 bg-green-50 border-2 border-green-200 rounded-2xl mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-green-700 font-semibold text-sm sm:text-base">{success}</p>
              </div>
            )}

            {/* Deck Settings */}
            {readyToSave && (
              <div className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-600 font-bold">⚙️</span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-lg sm:text-xl">Deck Settings</h4>
                </div>
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Deck Name *
                    </label>
                    <input
                      type="text"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm sm:text-base transition-all"
                      placeholder="Enter deck name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={deckDescription}
                      onChange={(e) => setDeckDescription(e.target.value)}
                      className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none text-sm sm:text-base transition-all"
                      rows={3}
                      placeholder="Describe your deck..."
                    />
                  </div>
                  <button
                    onClick={saveToDeck}
                    disabled={isProcessing || !deckName.trim()}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Creating Deck...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <span>🚀</span>
                        <span>Create Deck ({allCards.length} cards)</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Preview Cards */}
            {preview.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-bold">👀</span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-lg sm:text-xl">Preview (first 5 cards)</h4>
                </div>
                <div className="space-y-4">
                  {preview.map((card, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-xs">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">Card {index + 1}</span>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-3 sm:p-4 border border-blue-200">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">FRONT</p>
                          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{card.front}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 border border-green-200">
                          <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">BACK</p>
                          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{card.back}</p>
                        </div>
                      </div>
                      {card.tags && card.tags.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">TAGS</p>
                          <div className="flex flex-wrap gap-2">
                            {card.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
