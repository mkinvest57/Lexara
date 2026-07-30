import { IsString, IsOptional, IsIn, IsInt, Min } from 'class-validator';

export class CreateVocabEntryDto {
  @IsString()
  term: string;

  @IsString()
  language: string;

  @IsString()
  translation: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  tokenId?: string;

  @IsString()
  @IsOptional()
  lessonId?: string;

  @IsString()
  @IsOptional()
  context?: string;
}
