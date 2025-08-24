import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AnkiCard {
  front: string;
  back: string;
  tags?: string[];
}

// POST /api/import-csv - Create a deck from CSV data
export async function POST(request: NextRequest) {
  try {
    const { cards, deckName, description } = await request.json();

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: 'Cards array is required' },
        { status: 400 }
      );
    }

    if (!deckName || deckName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Deck name is required' },
        { status: 400 }
      );
    }

    // Validate cards
    for (const card of cards) {
      if (!card.front?.trim() || !card.back?.trim()) {
        return NextResponse.json(
          { error: 'All cards must have front and back content' },
          { status: 400 }
        );
      }
    }

    // Create deck with cards in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the deck
      const deck = await tx.deck.create({
        data: {
          name: deckName.trim(),
          description: description?.trim() || null,
        }
      });

      // Create all cards
      await tx.card.createMany({
        data: cards.map((card: AnkiCard) => ({
          front: card.front.trim(),
          back: card.back.trim(),
          tags: card.tags || [],
          deckId: deck.id
        }))
      });

      // Return deck with cards
      return await tx.deck.findUnique({
        where: { id: deck.id },
        include: {
          cards: {
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: { cards: true }
          }
        }
      });
    });

    console.log(`Created deck "${deckName}" with ${cards.length} cards`);

    return NextResponse.json({
      success: true,
      message: `Successfully created deck "${deckName}" with ${cards.length} cards`,
      deck: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error importing CSV data:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV data' },
      { status: 500 }
    );
  }
}
