import EventEmitter from 'events';
import { ChatResultDeltaDto } from '../../llm/dtos/chat-result-delta.dto';

export type StreamState = {
  buffer: ChatResultDeltaDto[];
  emitter: EventEmitter;
  done: boolean;
};
