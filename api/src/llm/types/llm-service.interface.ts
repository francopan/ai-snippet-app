import { ChatMessage } from '../dtos/chat-message';
import { ChatResultDto } from '../dtos/chat-result.dto';

export interface LLMServiceInterface {
  generate(
    messages: ChatMessage[],
    stream: boolean,
    model?: string,
  ): Promise<ChatResultDto | AsyncGenerator<ChatResultDto>>;
}
