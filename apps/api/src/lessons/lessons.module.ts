import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { TokenizerService } from './tokenizer.service';

@Module({
  controllers: [LessonsController],
  providers: [LessonsService, TokenizerService],
  exports: [LessonsService],
})
export class LessonsModule {}
