import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTextSummaryDto {
  @IsNotEmpty()
  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  summary?: string | null;
}
