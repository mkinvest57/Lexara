import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SrsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all due cards for review
   */
  async getDueCards(userId: string, limit: number = 20) {
    const now = new Date();

    const dueItems = await this.prisma.sRSItem.findMany({
      where: {
        nextReview: {
          lte: now,
        },
        vocabEntry: {
          userId,
          status: {
            in: [1, 2, 3], // Only learning cards, not known (4)
          },
        },
      },
      include: {
        vocabEntry: {
          include: {
            occurrences: {
              take: 1,
              orderBy: { encounteredAt: 'desc' },
            },
          },
        },
      },
      orderBy: {
        nextReview: 'asc',
      },
      take: limit,
    });

    return dueItems;
  }

  /**
   * Submit a review answer and update SRS schedule
   */
  async submitReview(userId: string, srsItemId: string, correct: boolean) {
    const srsItem = await this.prisma.sRSItem.findUnique({
      where: { id: srsItemId },
      include: {
        vocabEntry: true,
      },
    });

    if (!srsItem || srsItem.vocabEntry.userId !== userId) {
      throw new Error('SRS item not found');
    }

    // SM-2 simplified algorithm
    let newInterval = srsItem.interval;
    let newStatus = srsItem.vocabEntry.status;

    if (correct) {
      // Increase interval: 1 -> 3 -> 7 -> 14 -> 30
      if (newInterval === 1) newInterval = 3;
      else if (newInterval === 3) newInterval = 7;
      else if (newInterval === 7) newInterval = 14;
      else if (newInterval === 14) newInterval = 30;
      else newInterval = Math.min(90, newInterval * 2);

      // Increase status if answered correctly twice in a row
      if (srsItem.successCount >= 1 && newStatus < 4) {
        newStatus++;
      }
    } else {
      // Reset to 1 day
      newInterval = 1;
      if (newStatus > 1) {
        newStatus--;
      }
    }

    const nextReview = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);

    // Update in transaction
    return this.prisma.$transaction(async (tx) => {
      // Update SRS item
      await tx.sRSItem.update({
        where: { id: srsItemId },
        data: {
          nextReview,
          lastReview: new Date(),
          interval: newInterval,
          successCount: correct ? srsItem.successCount + 1 : 0,
          failCount: correct ? srsItem.failCount : srsItem.failCount + 1,
        },
      });

      // Update vocab entry status
      await tx.vocabEntry.update({
        where: { id: srsItem.vocabEntryId },
        data: {
          status: newStatus,
        },
      });

      return { nextReview, newStatus, newInterval };
    });
  }

  /**
   * Create a new review session
   */
  async createSession(userId: string, itemsCount: number, type: string = 'flashcard') {
    return this.prisma.reviewSession.create({
      data: {
        userId,
        itemsCount,
        type,
      },
    });
  }

  /**
   * End a review session
   */
  async endSession(sessionId: string, correctCount: number) {
    return this.prisma.reviewSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        correctCount,
      },
    });
  }
}
