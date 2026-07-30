import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLanguageProfileDto } from './dto/create-language-profile.dto';
import { UpdateLanguageProfileDto } from './dto/update-language-profile.dto';

@Injectable()
export class LanguageProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateLanguageProfileDto) {
    const existing = await this.prisma.languageProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('User already has a language profile');
    }

    return this.prisma.languageProfile.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.languageProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Language profile not found');
    }

    return profile;
  }

  async update(userId: string, dto: UpdateLanguageProfileDto) {
    return this.prisma.languageProfile.update({
      where: { userId },
      data: dto,
    });
  }
}
