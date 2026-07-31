import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LanguageProfilesModule } from './language-profiles/language-profiles.module';
import { LessonsModule } from './lessons/lessons.module';
import { VocabModule } from './vocab/vocab.module';
import { SrsModule } from './srs/srs.module';
import { StatsModule } from './stats/stats.module';
import { validateEnvironment } from './config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    LanguageProfilesModule,
    LessonsModule,
    VocabModule,
    SrsModule,
    StatsModule,
  ],
})
export class AppModule {}
