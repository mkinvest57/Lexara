import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVocabEntryDto } from './dto/create-vocab-entry.dto';

@Injectable()
export class VocabService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateVocabEntryDto) {
    // Check if already exists
    const existing = await this.prisma.vocabEntry.findUnique({
      where: {
        userId_term_language: {
          userId,
          term: dto.term,
          language: dto.language,
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Create vocab entry and SRS item
    return this.prisma.$transaction(async (tx) => {
      const vocabEntry = await tx.vocabEntry.create({
        data: {
          userId,
          term: dto.term,
          language: dto.language,
          translation: dto.translation,
          notes: dto.notes,
          status: 1,
        },
      });

      // Create SRS item with first review tomorrow
      await tx.sRSItem.create({
        data: {
          vocabEntryId: vocabEntry.id,
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 day
          interval: 1,
        },
      });

      // Create occurrence if token provided
      if (dto.tokenId && dto.lessonId && dto.context) {
        await tx.vocabOccurrence.create({
          data: {
            vocabEntryId: vocabEntry.id,
            tokenId: dto.tokenId,
            lessonId: dto.lessonId,
            context: dto.context,
          },
        });
      }

      return vocabEntry;
    });
  }

  async findAll(userId: string, status?: number) {
    return this.prisma.vocabEntry.findMany({
      where: {
        userId,
        ...(status !== undefined && { status }),
      },
      include: {
        occurrences: {
          take: 1,
          orderBy: { encounteredAt: 'desc' },
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        srsItem: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, userId: string, status: number) {
    return this.prisma.vocabEntry.update({
      where: {
        id,
        userId,
      },
      data: {
        status,
      },
    });
  }
}
