import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LanguageProfilesService } from './language-profiles.service';
import { CreateLanguageProfileDto } from './dto/create-language-profile.dto';
import { UpdateLanguageProfileDto } from './dto/update-language-profile.dto';

@Controller('language-profile')
@UseGuards(JwtAuthGuard)
export class LanguageProfilesController {
  constructor(private languageProfilesService: LanguageProfilesService) {}

  @Post()
  async create(@CurrentUser() user, @Body() dto: CreateLanguageProfileDto) {
    return this.languageProfilesService.create(user.userId, dto);
  }

  @Get()
  async findOne(@CurrentUser() user) {
    return this.languageProfilesService.findByUserId(user.userId);
  }

  @Patch()
  async update(@CurrentUser() user, @Body() dto: UpdateLanguageProfileDto) {
    return this.languageProfilesService.update(user.userId, dto);
  }
}
