import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('today')
  async getTodayStats(@CurrentUser() user) {
    return this.statsService.getTodayStats(user.userId);
  }

  @Get('overview')
  async getOverviewStats(@CurrentUser() user) {
    return this.statsService.getOverviewStats(user.userId);
  }

  @Post('log/reading')
  async logReading(
    @CurrentUser() user,
    @Body('language') language: string,
    @Body('wordsRead') wordsRead: number,
    @Body('minutes') minutes?: number
  ) {
    return this.statsService.logReading(user.userId, language, wordsRead, minutes);
  }

  @Post('log/review')
  async logReview(
    @CurrentUser() user,
    @Body('language') language: string,
    @Body('cardsCount') cardsCount: number
  ) {
    return this.statsService.logReview(user.userId, language, cardsCount);
  }
}
