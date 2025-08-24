import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/cards/[id] - Update a specific card
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { front, back, tags } = await request.json();

    if (!front?.trim() || !back?.trim()) {
      return NextResponse.json(
        { error: 'Front and back content are required' },
        { status: 400 }
      );
    }

    const card = await prisma.card.update({
      where: { id: params.id },
      data: {
        front: front.trim(),
        back: back.trim(),
        tags: tags || [],
      }
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[id] - Delete a specific card
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.card.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}
