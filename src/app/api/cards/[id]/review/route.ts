import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type DifficultyLevel = 'again' | 'hard' | 'good' | 'easy';

// Calculate next interval based on spaced repetition algorithm (SM-2 inspired)
function calculateInterval(
  difficulty: DifficultyLevel,
  currentInterval: number,
  repetitions: number,
  easeFactor: number,
  totalCards: number
): { newInterval: number; newEaseFactor: number; newRepetitions: number } {
  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newInterval: number;

  // Base intervals in minutes, lightly scaled by deck size
  const scaleFactor = Math.min(2, 1 + (totalCards / 50)); // Max 2x scaling for large decks
  const baseIntervals = {
    again: Math.max(1, Math.floor(3 * scaleFactor)), // 3-6 minutes
    hard: Math.max(2, Math.floor(6 * scaleFactor)), // 6-12 minutes  
    good: Math.max(4, Math.floor(10 * scaleFactor)), // 10-20 minutes
    easy: Math.max(6, Math.floor(15 * scaleFactor)) // 15-30 minutes
  };

  switch (difficulty) {
    case 'again':
      // Reset progress, show again soon
      newRepetitions = 0;
      newEaseFactor = Math.max(1.3, easeFactor - 0.2);
      newInterval = baseIntervals.again;
      break;

    case 'hard':
      // Slight progress, but reduce ease factor
      newRepetitions = Math.max(0, repetitions);
      newEaseFactor = Math.max(1.3, easeFactor - 0.15);
      newInterval = repetitions === 0 ? baseIntervals.hard : Math.floor(currentInterval * 1.2);
      break;

    case 'good':
      // Normal progress
      newRepetitions = repetitions + 1;
      
      if (newRepetitions === 1) {
        newInterval = baseIntervals.good;
      } else if (newRepetitions === 2) {
        newInterval = Math.floor(baseIntervals.good * 2); // ~40+ minutes
      } else {
        // After 2+ successful reviews, switch to days
        newInterval = Math.floor(currentInterval * easeFactor * 24 * 60); // Convert to minutes
      }
      break;

    case 'easy':
      // Fast progress, increase ease factor
      newRepetitions = repetitions + 1;
      newEaseFactor = Math.min(2.5, easeFactor + 0.15);
      
      if (newRepetitions === 1) {
        newInterval = baseIntervals.easy;
      } else if (newRepetitions === 2) {
        newInterval = Math.floor(baseIntervals.easy * 3); // ~90+ minutes
      } else {
        // After 2+ successful reviews, switch to days with bonus
        newInterval = Math.floor(currentInterval * easeFactor * 24 * 60 * 1.3);
      }
      break;
  }

  // Special handling for cards reviewed multiple times
  if (newRepetitions >= 3) {
    // Convert to days (minimum 1 day, maximum based on ease factor)
    const daysInterval = Math.min(
      Math.floor(newInterval / (24 * 60)), 
      Math.floor(newRepetitions * easeFactor)
    );
    newInterval = Math.max(1, daysInterval) * 24 * 60; // Convert back to minutes
  }

  return { newInterval, newEaseFactor, newRepetitions };
}

// POST /api/cards/[id]/review - Record a review response
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { difficulty, responseTime, totalCards } = await request.json();

    if (!['again', 'hard', 'good', 'easy'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Get current card data
    const card = await prisma.card.findUnique({
      where: { id: params.id },
      include: { deck: true }
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const intervalBefore = card.interval;

    // Calculate new interval and parameters
    const { newInterval, newEaseFactor, newRepetitions } = calculateInterval(
      difficulty as DifficultyLevel,
      card.interval,
      card.repetitions,
      card.easeFactor,
      totalCards || 10 // Default fallback
    );

    // Calculate next review date
    const nextReviewDate = new Date(now.getTime() + newInterval * 60 * 1000);

    // Update card and create review session in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update card
      const updatedCard = await tx.card.update({
        where: { id: params.id },
        data: {
          interval: newInterval,
          repetitions: newRepetitions,
          easeFactor: newEaseFactor,
          nextReviewDate,
          lastReviewed: now,
          reviewCount: card.reviewCount + 1,
        }
      });

      // Create review session record
      await tx.reviewSession.create({
        data: {
          cardId: params.id,
          deckId: card.deckId,
          difficulty: difficulty as string,
          responseTime: responseTime || 0,
          intervalBefore,
          intervalAfter: newInterval,
        }
      });

      return updatedCard;
    });

    // Format response with human-readable interval
    const intervalDisplay = newInterval < 60 
      ? `${newInterval} minutes`
      : newInterval < 24 * 60
      ? `${Math.floor(newInterval / 60)} hours`
      : `${Math.floor(newInterval / (24 * 60))} days`;

    return NextResponse.json({
      success: true,
      card: result,
      nextReview: {
        date: nextReviewDate,
        interval: newInterval,
        display: intervalDisplay
      }
    });

  } catch (error) {
    console.error('Error recording review:', error);
    return NextResponse.json(
      { error: 'Failed to record review' },
      { status: 500 }
    );
  }
}
