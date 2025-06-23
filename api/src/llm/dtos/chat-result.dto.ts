import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsISO8601, IsObject, IsString } from 'class-validator';
import { ChatMessage } from './chat-message';

export class ChatResultDto {
  @ApiProperty({ example: 'phi3' })
  @IsString()
  model!: string;

  @ApiProperty({
    description: 'ISO 8601 formatted date',
    example: '2025-06-20T02:00:00Z',
  })
  @IsISO8601()
  createdAt!: string;

  @ApiProperty({ type: ChatMessage })
  @IsObject()
  @Type(() => ChatMessage)
  message!: ChatMessage;

  @ApiProperty({ example: true })
  @IsBoolean()
  done!: boolean;
}
