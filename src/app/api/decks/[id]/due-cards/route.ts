import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/decks/[id]/due-cards - Get cards due for review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includeNew = searchParams.get('includeNew') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const { id } = await params;

    const now = new Date();

    // Get cards due for review
    const whereClause = {
      deckId: id,
      OR: [
        // Cards that are due for review
        { nextReviewDate: { lte: now } },
        // Optionally include new cards (never reviewed)
        ...(includeNew ? [{ reviewCount: 0 }] : [])
      ]
    };

    const dueCards = await prisma.card.findMany({
      where: whereClause,
      include: {
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          take: 1 // Get last review for context
        }
      },
      orderBy: [
        // Prioritize overdue cards
        { nextReviewDate: 'asc' },
        // Then by creation date for new cards
        { createdAt: 'asc' }
      ],
      ...(limit && { take: limit })
    });

    // Get deck info
    const deck = await prisma.deck.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: {
          select: { cards: true }
        }
      }
    });

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const stats = {
      totalCards: deck._count.cards,
      dueCards: dueCards.length,
      newCards: dueCards.filter(card => card.reviewCount === 0).length,
      reviewCards: dueCards.filter(card => card.reviewCount > 0).length
    };

    // Add time until next review for each card
    const cardsWithTimeInfo = dueCards.map(card => {
      const timeDiff = now.getTime() - card.nextReviewDate.getTime();
      const isOverdue = timeDiff > 0;
      const timeDisplay = isOverdue 
        ? `Overdue by ${Math.floor(timeDiff / (1000 * 60))} minutes`
        : `Due in ${Math.floor(-timeDiff / (1000 * 60))} minutes`;

      return {
        ...card,
        isNew: card.reviewCount === 0,
        isOverdue,
        timeDisplay,
        reviews: card.reviews[0] // Only latest review
      };
    });

    return NextResponse.json({
      deck: {
        id: deck.id,
        name: deck.name
      },
      cards: cardsWithTimeInfo,
      stats
    });

  } catch (error) {
    console.error('Error fetching due cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch due cards' },
      { status: 500 }
    );
  }
}
