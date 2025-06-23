import { BadRequestException, Injectable } from '@nestjs/common';
import { modelToServiceMap } from '../../constants/model-to-service-map.constant';
import { ChatMessage } from '../../dtos/chat-message';
import { ChatResultDeltaDto } from '../../dtos/chat-result-delta.dto';
import { ChatResultDto } from '../../dtos/chat-result.dto';
import { ChatRole } from '../../enums/chat-role.enum';
import { ModelServiceProvider } from '../../enums/model-service-provider.enum';
import { LLMResponse } from '../../types/llm-response.type';
import { LLMServiceInterface } from '../../types/llm-service.interface';
import { GeminiService } from '../gemini/gemini.service';
import { OllamaService } from '../ollama/ollama.service';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class LLMService {
  private defaultModel = 'phi3';

  constructor(
    private geminiService: GeminiService,
    private ollamaService: OllamaService,
    private openAIService: OpenAIService,
  ) {}

  async generate(
    messages: ChatMessage[],
    model?: string,
    stream = false,
  ): Promise<LLMResponse> {
    const selectedModel = model ?? this.defaultModel;
    const service = this.getModelService(selectedModel);
    const rawResponse = await service.generate(messages, stream, selectedModel);
    const isAsyncIterable =
      rawResponse &&
      typeof rawResponse === 'object' &&
      Symbol.asyncIterator in rawResponse;

    if (!stream || !isAsyncIterable) {
      return rawResponse as ChatResultDto;
    }

    const streamResponse = rawResponse as AsyncGenerator<ChatResultDto>;

    return (async function* (): AsyncGenerator<ChatResultDeltaDto> {
      let previousContent = '';

      for await (const chunk of streamResponse) {
        const currentContent = chunk.message.content;
        const delta = currentContent.startsWith(previousContent)
          ? currentContent.slice(previousContent.length)
          : currentContent;

        previousContent = currentContent;

        yield {
          message: {
            role: ChatRole.assistant,
            content: delta,
          },
        } as ChatResultDeltaDto;
      }

      yield {
        done: true,
        message: {
          role: ChatRole.assistant,
          content: '',
        },
      } as ChatResultDeltaDto;
    })();
  }

  private getModelService(model: string): LLMServiceInterface {
    const serviceProvider = modelToServiceMap[model];
    if (!serviceProvider) {
      throw new BadRequestException(`Unknown model: ${model}`);
    }

    switch (serviceProvider) {
      case ModelServiceProvider.GEMINI:
        return this.geminiService;
      case ModelServiceProvider.OPENAI:
        return this.openAIService;
      case ModelServiceProvider.OLLAMA:
        return this.ollamaService;
      default:
        throw new Error(`Unsupported service provider: ${serviceProvider}`);
    }
  }
}
