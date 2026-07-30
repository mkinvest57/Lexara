import { IsString, IsIn, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateLanguageProfileDto {
  @IsString()
  @IsOptional()
  targetLanguage?: string;

  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  @IsOptional()
  level?: string;

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
