import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ChatRole } from '../../enums/chat-role.enum';
import { ChatMessage } from '../../dtos/chat-message';
import { ChatResultDto } from '../../dtos/chat-result.dto';
import { LLMServiceInterface } from '../../types/llm-service.interface';

@Injectable()
export class GeminiService implements LLMServiceInterface {
  private ai: GoogleGenAI;
  private model = 'models/gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
  }

  public async generate(
    messages: ChatMessage[],
    stream: boolean = false,
    model?: string,
  ): Promise<ChatResultDto | AsyncGenerator<ChatResultDto>> {
    const selectedModel = model ?? this.model;
    const now = new Date().toISOString();

    // Merge all system messages into one systemInstruction
    const systemInstruction = messages
      .filter(msg => msg.role === ChatRole.system)
      .map(msg => msg.content)
      .join('\n\n')
      .trim();

    // Only pass user and model messages to Gemini's contents
    const geminiMessages = messages
      .filter(msg => msg.role !== ChatRole.system)
      .map(msg => ({
        role: msg.role === ChatRole.user ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    const config = systemInstruction ? { systemInstruction } : undefined;

    if (!stream) {
      const result = await this.ai.models.generateContent({
        model: selectedModel,
        contents: geminiMessages,
        config,
      });

      return {
        model: selectedModel,
        createdAt: now,
        message: {
          role: ChatRole.assistant,
          content: result.text ?? '',
        },
        done: true,
      };
    }

    const resultStream = await this.ai.models.generateContentStream({
      model: selectedModel,
      contents: geminiMessages,
      config,
    });

    async function* streamGenerator(): AsyncGenerator<ChatResultDto> {
      let accumulated = '';

      for await (const chunk of resultStream) {
        const text = chunk.text;
        if (text) {
          accumulated += text;
          yield {
            model: selectedModel,
            createdAt: now,
            message: {
              role: ChatRole.assistant,
              content: accumulated,
            },
            done: false,
          };
        }
      }

      yield {
        model: selectedModel,
        createdAt: now,
        message: {
          role: ChatRole.assistant,
          content: accumulated,
        },
        done: true,
      };
    }

    return streamGenerator();
  }
}
