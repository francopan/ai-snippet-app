import { Injectable } from '@nestjs/common';
import { ChatRole } from '../../enums/chat-role.enum';
import { ChatMessage } from '../../dtos/chat-message';
import { ChatResultDto } from '../../dtos/chat-result.dto';
import OpenAI from 'openai';
import { Stream } from 'openai/core/streaming';
import { LLMServiceInterface } from '../../types/llm-service.interface';

@Injectable()
export class OpenAIService implements LLMServiceInterface {
  private openai: OpenAI;
  private model = 'gpt-3.5-turbo-0125';

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async generate(
    messages: ChatMessage[],
    stream = false,
    model?: string,
  ): Promise<ChatResultDto | AsyncGenerator<ChatResultDto>> {
    const selectedModel = model ?? this.model;
    const now = new Date().toISOString();
    const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      this.mapToOpenAIFormat(messages);

    if (!stream) {
      return await this.plainGenerator(selectedModel, openAIMessages, now);
    }

    const responseStream = await this.openai.chat.completions.create({
      model: selectedModel,
      messages: openAIMessages,
      stream: true,
    });

    return this.streamGenerator(selectedModel, responseStream);
  }

  private async plainGenerator(
    selectedModel: string,
    openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    now: string,
  ) {
    const response = await this.openai.chat.completions.create({
      model: selectedModel,
      messages: openAIMessages,
    });
    const choiceMessage = response.choices[0].message;

    return {
      model: selectedModel,
      createdAt: now,
      message: {
        role: ChatRole.assistant,
        content: choiceMessage.content ?? '',
      },
      done: true,
    };
  }

  private async *streamGenerator(
    selectedModel: string,
    responseStream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
      _request_id?: string | null;
    },
  ): AsyncGenerator<ChatResultDto> {
    let accumulated = '';

    for await (const part of responseStream) {
      // part is one chunk of the streamed response
      const delta = part.choices[0].delta?.content;
      if (delta) {
        accumulated += delta;
        yield {
          model: selectedModel,
          createdAt: new Date().toISOString(),
          message: { role: ChatRole.assistant, content: delta },
          done: false,
        };
      }

      if (part.choices[0].finish_reason) {
        // Stream finished
        yield {
          model: selectedModel,
          createdAt: new Date().toISOString(),
          message: { role: ChatRole.assistant, content: accumulated },
          done: true,
        };
        break;
      }
    }
  }

  private mapToOpenAIFormat(
    messages: ChatMessage[],
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages.map(msg => ({
      role:
        msg.role === ChatRole.user
          ? 'user'
          : msg.role === ChatRole.system
            ? 'system'
            : 'assistant',
      content: msg.content,
    }));
  }
}
