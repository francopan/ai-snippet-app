import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatMessage } from './chat-message';

export class ChatRequest {
  @ApiProperty({
    description: 'Array of chat messages',
    type: () => [ChatMessage],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessage)
  messages!: ChatMessage[];

  @ApiPropertyOptional({
    description: 'Model name to use for generation',
    example: 'phi3',
    type: String,
  })
  @IsOptional()
  @IsString()
  model?: string;
}
