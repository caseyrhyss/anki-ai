import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/decks - Get all decks
export async function GET() {
  try {
    const decks = await prisma.deck.findMany({
      include: {
        cards: true,
        _count: {
          select: { cards: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    );
  }
}

// POST /api/decks - Create a new deck
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Deck name is required' },
        { status: 400 }
      );
    }

    const deck = await prisma.deck.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
      include: {
        cards: true,
        _count: {
          select: { cards: true }
        }
      }
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    );
  }
}
