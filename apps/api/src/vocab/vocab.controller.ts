import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { VocabService } from './vocab.service';
import { CreateVocabEntryDto } from './dto/create-vocab-entry.dto';
import { TranslationService } from './translation.service';

@Controller('vocab')
@UseGuards(JwtAuthGuard)
export class VocabController {
  constructor(
    private vocabService: VocabService,
    private translationService: TranslationService
  ) {}

  @Post()
  async create(@CurrentUser() user, @Body() dto: CreateVocabEntryDto) {
    return this.vocabService.create(user.userId, dto);
  }

  @Get()
  async findAll(@CurrentUser() user, @Query('status') status?: string) {
    const statusNum = status ? parseInt(status) : undefined;
    return this.vocabService.findAll(user.userId, statusNum);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body('status') status: number
  ) {
    return this.vocabService.updateStatus(id, user.userId, status);
  }

  @Post('translate')
  async translate(
    @Body('text') text: string,
    @Body('targetLang') targetLang: string,
    @Body('context') context?: string
  ) {
    return this.translationService.translate(text, targetLang, context);
  }
}
