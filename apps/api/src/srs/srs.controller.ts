import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SrsService } from './srs.service';

@Controller('srs')
@UseGuards(JwtAuthGuard)
export class SrsController {
  constructor(private srsService: SrsService) {}

  @Get('due')
  async getDueCards(@CurrentUser() user, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.srsService.getDueCards(user.userId, limitNum);
  }

  @Post('review')
  async submitReview(
    @CurrentUser() user,
    @Body('srsItemId') srsItemId: string,
    @Body('correct') correct: boolean
  ) {
    return this.srsService.submitReview(user.userId, srsItemId, correct);
  }

  @Post('session/start')
  async startSession(
    @CurrentUser() user,
    @Body('itemsCount') itemsCount: number,
    @Body('type') type?: string
  ) {
    return this.srsService.createSession(user.userId, itemsCount, type);
  }

  @Post('session/:id/end')
  async endSession(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body('correctCount') correctCount: number
  ) {
    return this.srsService.endSession(id, user.userId, correctCount);
  }
}
