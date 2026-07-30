import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LessonsService } from './lessons.service';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get()
  async findAll(@CurrentUser() user, @Query('profileId') profileId: string, @Query('level') level?: string) {
    return this.lessonsService.findAll(profileId, level);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.lessonsService.findOne(id, user.userId);
  }
}
