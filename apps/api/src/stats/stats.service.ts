import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get today's stats
   */
  async getTodayStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await this.prisma.activityLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    const wordsRead = logs
      .filter((log) => log.type === 'read')
      .reduce((sum, log) => sum + log.wordsRead, 0);

    const minutesListened = logs
      .filter((log) => log.type === 'read')
      .reduce((sum, log) => sum + log.minutes, 0);

    const cardsReviewed = logs
      .filter((log) => log.type === 'review')
      .reduce((sum, log) => sum + log.wordsRead, 0); // Using wordsRead as card count

    return {
      wordsRead,
      minutesListened,
      cardsReviewed,
    };
  }

  /**
   * Get overall stats
   */
  async getOverviewStats(userId: string) {
    const [knownWords, totalLingqs, totalWordsRead, dueCards] = await Promise.all([
      // Known words (status 4)
      this.prisma.vocabEntry.count({
        where: {
          userId,
          status: 4,
        },
      }),

      // Total saved vocabulary entries
      this.prisma.vocabEntry.count({
        where: {
          userId,
        },
      }),

      // Total words read
      this.prisma.activityLog.aggregate({
        where: {
          userId,
          type: 'read',
        },
        _sum: {
          wordsRead: true,
        },
      }),

      // Due cards
      this.prisma.sRSItem.count({
        where: {
          nextReview: {
            lte: new Date(),
          },
          vocabEntry: {
            userId,
            status: {
              in: [1, 2, 3],
            },
          },
        },
      }),
    ]);

    return {
      knownWords,
      totalLingqs,
      totalWordsRead: totalWordsRead._sum.wordsRead || 0,
      dueCards,
    };
  }

  /**
   * Log a reading activity
   */
  async logReading(userId: string, language: string, wordsRead: number, minutes: number = 0) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        type: 'read',
        language,
        wordsRead,
        minutes,
      },
    });
  }

  /**
   * Log a review activity
   */
  async logReview(userId: string, language: string, cardsCount: number) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        type: 'review',
        language,
        wordsRead: cardsCount, // Using wordsRead field for card count
      },
    });
  }
}
