import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenizerService } from './tokenizer.service';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private tokenizerService: TokenizerService
  ) {}

  async findAll(profileId: string, level?: string) {
    return this.prisma.lesson.findMany({
      where: {
        profileId,
        ...(level && { level }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        type: true,
        imageUrl: true,
        level: true,
        wordCount: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id,
        profile: {
          userId,
        },
      },
      include: {
        sentences: {
          orderBy: { index: 'asc' },
          include: {
            tokens: {
              orderBy: { index: 'asc' },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async create(profileId: string, data: { title: string; content: string; type: string; level: string; imageUrl?: string; sourceUrl?: string }) {
    const wordCount = this.tokenizerService.countWords(data.content);
    const sentences = this.tokenizerService.tokenizeText(data.content);

    // Create lesson with sentences and tokens in a transaction
    return this.prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: {
          profileId,
          title: data.title,
          content: data.content,
          type: data.type,
          level: data.level,
          imageUrl: data.imageUrl,
          sourceUrl: data.sourceUrl,
          wordCount,
        },
      });

      // Create sentences and tokens
      for (let i = 0; i < sentences.length; i++) {
        const sentenceText = sentences[i];
        const sentence = await tx.sentence.create({
          data: {
            lessonId: lesson.id,
            index: i,
            text: sentenceText,
          },
        });

        const tokens = this.tokenizerService.tokenizeSentence(sentenceText);
        for (let j = 0; j < tokens.length; j++) {
          await tx.token.create({
            data: {
              sentenceId: sentence.id,
              index: j,
              form: tokens[j],
              lemma: tokens[j].toLowerCase(), // Simple lemmatization for MVP
            },
          });
        }
      }

      return lesson;
    });
  }
}
