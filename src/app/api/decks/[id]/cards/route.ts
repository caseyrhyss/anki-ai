import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AnkiCard {
  front: string;
  back: string;
  tags?: string[];
}

// POST /api/decks/[id]/cards - Add cards to a deck (for CSV import)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { cards } = await request.json();
    const { id } = await params;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: 'Cards array is required' },
        { status: 400 }
      );
    }

    // Verify deck exists
    const deck = await prisma.deck.findUnique({
      where: { id }
    });

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    // Create cards in batch
    const createdCards = await prisma.card.createMany({
      data: cards.map((card: AnkiCard) => ({
        front: card.front.trim(),
        back: card.back.trim(),
        tags: card.tags || [],
        deckId: id
      }))
    });

    // Fetch the created cards to return them
    const deckWithCards = await prisma.deck.findUnique({
      where: { id },
      include: {
        cards: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      count: createdCards.count,
      deck: deckWithCards
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding cards to deck:', error);
    return NextResponse.json(
      { error: 'Failed to add cards to deck' },
      { status: 500 }
    );
  }
}

// PUT /api/decks/[id]/cards - Update all cards in a deck (replace)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { cards } = await request.json();
    const { id } = await params;

    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json(
        { error: 'Cards array is required' },
        { status: 400 }
      );
    }

    // Verify deck exists
    const deck = await prisma.deck.findUnique({
      where: { id }
    });

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    // Delete existing cards and create new ones in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all existing cards in the deck
      await tx.card.deleteMany({
        where: { deckId: id }
      });

      // Create new cards if any
      if (cards.length > 0) {
        await tx.card.createMany({
          data: cards.map((card: AnkiCard) => ({
            front: card.front.trim(),
            back: card.back.trim(),
            tags: card.tags || [],
            deckId: id
          }))
        });
      }
    });

    // Fetch updated deck with cards
    const updatedDeck = await prisma.deck.findUnique({
      where: { id },
      include: {
        cards: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      deck: updatedDeck
    });

  } catch (error) {
    console.error('Error updating cards in deck:', error);
    return NextResponse.json(
      { error: 'Failed to update cards in deck' },
      { status: 500 }
    );
  }
}
