import { Module } from '@nestjs/common';
import { VocabController } from './vocab.controller';
import { VocabService } from './vocab.service';
import { TranslationService } from './translation.service';

@Module({
  controllers: [VocabController],
  providers: [VocabService, TranslationService],
  exports: [VocabService],
})
export class VocabModule {}
