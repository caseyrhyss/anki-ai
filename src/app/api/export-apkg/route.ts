import { NextRequest, NextResponse } from 'next/server';

interface AnkiCard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { cards, deckName } = await request.json();
    
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: 'No cards provided for export' },
        { status: 400 }
      );
    }
    
    console.log(`Generating Anki import file for ${cards.length} cards`);
    
    // Generate Anki-compatible text format
    // Format: Front\tBack\tTags (tab-separated)
    const ankiText = cards.map((card: AnkiCard) => {
      const front = card.front.replace(/\t/g, ' ').replace(/\n/g, '<br>');
      const back = card.back.replace(/\t/g, ' ').replace(/\n/g, '<br>');
      const tags = card.tags ? card.tags.join(' ') : '';
      
      return `${front}\t${back}\t${tags}`;
    }).join('\n');
    
    // Add header with deck information
    const fileContent = `# Anki Deck: ${deckName || 'Imported Cards'}
# Generated on: ${new Date().toISOString()}
# Import Instructions:
# 1. Open Anki
# 2. Go to File → Import
# 3. Select this file
# 4. Choose "Basic" note type
# 5. Map fields: Field 1 → Front, Field 2 → Back, Field 3 → Tags
# 6. Click Import

${ankiText}`;
    
    console.log(`Successfully generated Anki import file with ${cards.length} cards`);
    
    // Return the file as a download
    const filename = `${(deckName || 'cards').replace(/[^a-zA-Z0-9-_]/g, '_')}_anki_import.txt`;
    
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(fileContent, 'utf8').toString(),
      },
    });
    
  } catch (error) {
    console.error('Anki export error:', error);
    
    let errorMessage = 'Failed to export cards for Anki import';
    
    if (error instanceof Error) {
      errorMessage = `Export failed: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
