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
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Import CSV Cards</h2>
          <p className="text-gray-600">
            Upload a CSV file with your flashcard data. Your CSV should have columns named &quot;front&quot; and &quot;back&quot;.
          </p>
        </div>

        {/* CSV Format Help */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">CSV Format Requirements:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Required columns:</strong> &quot;front&quot; and &quot;back&quot; (or &quot;question&quot;/&quot;answer&quot;)</p>
            <p>• <strong>Optional column:</strong> &quot;tags&quot; (comma-separated)</p>
            <p>• <strong>Example:</strong></p>
            <div className="mt-2 bg-white p-2 rounded border font-mono text-xs">
              front,back,tags<br/>
              &quot;What is the capital of France?&quot;,&quot;Paris&quot;,&quot;geography,capitals&quot;<br/>
              &quot;Define photosynthesis&quot;,&quot;The process by which plants convert light energy to chemical energy&quot;,&quot;biology,plants&quot;
            </div>
          </div>
        </div>

        {/* Upload Area */}
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg text-blue-600">Drop your CSV file here...</p>
            ) : (
              <>
                <p className="text-lg text-gray-600 mb-2">
                  Drag & drop your CSV file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports .csv files up to 50MB
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isProcessing && (
              <div className="flex items-center space-x-2 text-blue-600 mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span>Processing CSV file...</span>
              </div>
            )}

            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-600 text-sm font-medium">Import Error</p>
                  <pre className="text-red-600 text-xs mt-1 whitespace-pre-wrap">{error}</pre>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-green-600 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Deck Settings */}
            {readyToSave && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">Deck Settings:</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deck Name
                    </label>
                    <input
                      type="text"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      placeholder="Enter deck name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={deckDescription}
                      onChange={(e) => setDeckDescription(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none"
                      rows={3}
                      placeholder="Describe your deck..."
                    />
                  </div>
                  <button
                    onClick={saveToDeck}
                    disabled={isProcessing || !deckName.trim()}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isProcessing ? (
                      <span className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Creating Deck...</span>
                      </span>
                    ) : (
                      `Create Deck (${allCards.length} cards)`
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Preview Cards */}
            {preview.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-3">Preview (first 5 cards):</h4>
                <div className="space-y-3">
                  {preview.map((card, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">FRONT</p>
                          <p className="text-sm text-gray-800">{card.front}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">BACK</p>
                          <p className="text-sm text-gray-800">{card.back}</p>
                        </div>
                      </div>
                      {card.tags && card.tags.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">TAGS</p>
                          <div className="flex flex-wrap gap-1">
                            {card.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
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
