import { IsString, IsIn, IsInt, Min, IsOptional } from 'class-validator';

export class CreateLanguageProfileDto {
  @IsString()
  targetLanguage: string;

  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  level: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  dailyGoalWords?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  dailyGoalMinutes?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  dailyGoalCards?: number;
}
