import { Module } from '@nestjs/common';
import { LanguageProfilesController } from './language-profiles.controller';
import { LanguageProfilesService } from './language-profiles.service';

@Module({
  controllers: [LanguageProfilesController],
  providers: [LanguageProfilesService],
  exports: [LanguageProfilesService],
})
export class LanguageProfilesModule {}
