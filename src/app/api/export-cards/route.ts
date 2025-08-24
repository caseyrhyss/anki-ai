import { NextRequest, NextResponse } from 'next/server';

interface AnkiCard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { cards, format, filename } = await request.json();
    
    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json(
        { error: 'No cards provided for export' },
        { status: 400 }
      );
    }
    
    let content: string;
    let contentType: string;
    
    switch (format) {
      case 'csv':
        content = exportToCSV(cards);
        contentType = 'text/csv';
        break;
        
      case 'json':
        content = exportToJSON(cards);
        contentType = 'application/json';
        break;
        
      case 'anki':
        content = exportToAnki(cards);
        contentType = 'text/plain';
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid export format' },
          { status: 400 }
        );
    }
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename || 'anki-cards'}.${format === 'anki' ? 'txt' : format}"`,
      },
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export cards' },
      { status: 500 }
    );
  }
}

function exportToCSV(cards: AnkiCard[]): string {
  const header = 'Front,Back,Tags\n';
  const rows = cards.map(card => {
    const front = escapeCSV(card.front);
    const back = escapeCSV(card.back);
    const tags = card.tags ? escapeCSV(card.tags.join(';')) : '';
    return `${front},${back},${tags}`;
  });
  
  return header + rows.join('\n');
}

function exportToJSON(cards: AnkiCard[]): string {
  return JSON.stringify(cards, null, 2);
}

function exportToAnki(cards: AnkiCard[]): string {
  // Anki import format: Front[TAB]Back[TAB]Tags
  const rows = cards.map(card => {
    const front = card.front.replace(/\t/g, ' ').replace(/\n/g, '<br>');
    const back = card.back.replace(/\t/g, ' ').replace(/\n/g, '<br>');
    const tags = card.tags ? card.tags.join(' ') : '';
    return `${front}\t${back}\t${tags}`;
  });
  
  return rows.join('\n');
}

function escapeCSV(text: string): string {
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  const escaped = text.replace(/"/g, '""');
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`;
  }
  return escaped;
}
