import { Injectable, Logger } from '@nestjs/common';
import { ChatMessage } from '../../llm/dtos/chat-message';
import { ChatResultDeltaDto } from '../../llm/dtos/chat-result-delta.dto';
import { ChatRole } from '../../llm/enums/chat-role.enum';
import { LLMService } from '../../llm/services/llm/llm.service';
import { CreateTextSummaryDto } from '../dtos/create-text-summary.dto';
import { TextSummaryDto } from '../dtos/text-summary.dto';
import { TextSummaryRepository } from '../repositories/text-summary.repository';
import { StreamState } from '../types/stream-state.dto';
import EventEmitter from 'events';

@Injectable()
export class TextSummaryService {
  private readonly logger = new Logger(TextSummaryService.name);
  private streams = new Map<string, StreamState>();

  constructor(
    private readonly llmService: LLMService,
    private readonly textSummaryRepository: TextSummaryRepository,
  ) {}

  async create(data: CreateTextSummaryDto): Promise<TextSummaryDto> {
    const createdSnippet = await this.textSummaryRepository.create(
      data.text,
      data.summary,
    );

    const state: StreamState = {
      buffer: [],
      emitter: new EventEmitter(),
      done: false,
    };
    this.streams.set(createdSnippet.id as string, state);

    this.startStreamingSummary(
      createdSnippet.id as string,
      data.text,
      state,
    ).catch(err =>
      this.logger.error(
        `Streaming failed for snippet ${createdSnippet.id}`,
        err,
      ),
    );

    return createdSnippet;
  }

  async findAll(): Promise<TextSummaryDto[]> {
    return await this.textSummaryRepository.getAll();
  }

  async findById(id: string): Promise<TextSummaryDto | null> {
    return await this.textSummaryRepository.getById(id);
  }

  async findPaginatedWithCount(
    page: number,
    limit: number,
  ): Promise<{ items: TextSummaryDto[]; total: number }> {
    return this.textSummaryRepository.getPaginatedWithCount(page, limit);
  }

  getStreamStateById(id: string): StreamState | undefined {
    return this.streams.get(id);
  }

  async update(
    id: string,
    data: Partial<{ text: string; summary: string }>,
  ): Promise<TextSummaryDto | null> {
    return await this.textSummaryRepository.update(id, data);
  }

  async remove(id: string): Promise<TextSummaryDto | null> {
    return await this.textSummaryRepository.delete(id);
  }

  private async startStreamingSummary(
    id: string,
    text: string,
    state: StreamState,
  ): Promise<void> {
    const messages: ChatMessage[] = [
      {
        role: ChatRole.system,
        content:
          'You are a strict summarizer. Summarize the following text in ~30 words or fewer.',
      },
      {
        role: ChatRole.user,
        content: text,
      },
    ];

    const rawResponse = await this.llmService.generate(
      messages,
      'models/gemini-1.5-flash',
      true,
    );
    if (
      !rawResponse ||
      typeof rawResponse !== 'object' ||
      !(Symbol.asyncIterator in rawResponse)
    ) {
      throw new Error(
        'LLM service did not return a streaming response as expected',
      );
    }

    const stream = rawResponse as AsyncGenerator<ChatResultDeltaDto>;
    let fullSummary = '';

    try {
      for await (const delta of stream) {
        state.buffer.push(delta);
        state.emitter.emit('delta', delta);

        const chunk = delta.message.content;
        fullSummary += chunk;

        await this.textSummaryRepository.update(id, { summary: fullSummary });
      }

      state.done = true;
      state.emitter.emit('end');
    } catch (error) {
      this.logger.error(`Error while streaming summary for ID ${id}:`, error);
      state.emitter.emit('error', error);
    }
  }
}
