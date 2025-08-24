import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/decks/[id] - Get a specific deck with cards
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deck = await prisma.deck.findUnique({
      where: { id: params.id },
      include: {
        cards: {
          orderBy: { createdAt: 'asc' }
        },
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

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deck' },
      { status: 500 }
    );
  }
}

// PUT /api/decks/[id] - Update a deck
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Deck name is required' },
        { status: 400 }
      );
    }

    const deck = await prisma.deck.update({
      where: { id: params.id },
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

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json(
      { error: 'Failed to update deck' },
      { status: 500 }
    );
  }
}

// DELETE /api/decks/[id] - Delete a deck
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.deck.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    );
  }
}
