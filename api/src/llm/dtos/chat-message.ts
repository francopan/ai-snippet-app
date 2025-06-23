import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { ChatRole } from '../enums/chat-role.enum';

export class ChatMessage {
  @ApiProperty({
    enum: ChatRole,
    description: 'Role of the message sender',
    example: ChatRole.assistant,
  })
  @IsEnum(ChatRole)
  role!: ChatRole;

  @ApiProperty({
    description: 'Content of the message',
    example: 'This is a content',
  })
  @IsString()
  content!: string;
}
