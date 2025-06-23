import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ChatMessage } from './chat-message';

export class ChatResultDeltaDto {
  @ApiProperty({ type: ChatMessage })
  @IsObject()
  @ValidateNested()
  @Type(() => ChatMessage)
  message!: ChatMessage;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
