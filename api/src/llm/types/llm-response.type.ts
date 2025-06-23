import { ChatResultDeltaDto } from '../dtos/chat-result-delta.dto';
import { ChatResultDto } from '../dtos/chat-result.dto';

export type LLMResponse =
  | ChatResultDto
  | AsyncGenerator<ChatResultDeltaDto, void>;
