import { Injectable } from '@nestjs/common';
import { ChatRole } from '../../enums/chat-role.enum';
import { OllamaChatResult } from '../../types/ollama-chat-result.type';
import { ChatMessage } from '../../dtos/chat-message';
import { ChatResultDto } from '../../dtos/chat-result.dto';
import { LLMServiceInterface } from '../../types/llm-service.interface';

@Injectable()
export class OllamaService implements LLMServiceInterface {
  private apiKey = process.env.CHAT_API_KEY!;
  private model = 'phi3';
  private apiUrl = 'https://ollama.francopan.com.br/api/chat';

  async generate(
    messages: ChatMessage[],
    stream = false,
    model?: string,
  ): Promise<ChatResultDto | AsyncGenerator<ChatResultDto>> {
    // updated return type
    const selectedModel = model ?? this.model;

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        api_key: this.apiKey,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        stream,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Chat API error: ${response.status} ${response.statusText}`,
      );
    }

    const now = new Date().toISOString();

    if (!stream) {
      const json = (await response.json()) as OllamaChatResult;
      const reply = json.message?.content;

      if (!reply) {
        throw new Error('No reply found in Chat response');
      }

      return {
        model: json.model ?? selectedModel,
        createdAt: json.created_at ?? now,
        message: {
          role: ChatRole.assistant,
          content: reply,
        },
        done: json.done ?? true,
      };
    }

    const reader =
      response.body && typeof response.body.getReader === 'function'
        ? response.body.getReader()
        : null;

    if (!reader) {
      throw new Error('Failed to get stream reader from response');
    }

    const decoder = new TextDecoder();

    return (async function* (): AsyncGenerator<ChatResultDto> {
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const parsed = JSON.parse(line) as OllamaChatResult;
            const chunk = parsed.message?.content ?? '';

            // Append new chunk to accumulated content
            if (chunk.startsWith(accumulatedContent)) {
              accumulatedContent = chunk;

              yield {
                model: parsed.model ?? selectedModel,
                createdAt: parsed.created_at ?? now,
                message: {
                  role: ChatRole.assistant,
                  content: accumulatedContent,
                },
                done: parsed.done ?? false,
              };
            } else {
              // If chunk doesn't start with previous content, reset
              accumulatedContent = chunk;

              yield {
                model: parsed.model ?? selectedModel,
                createdAt: parsed.created_at ?? now,
                message: {
                  role: ChatRole.assistant,
                  content: accumulatedContent,
                },
                done: parsed.done ?? false,
              };
            }
          } catch (err) {
            console.warn('Failed to parse streamed chunk:', line, err);
          }
        }
      }

      // Handle any leftover buffer content
      if (buffer) {
        try {
          const parsed = JSON.parse(buffer) as OllamaChatResult;
          const chunk = parsed.message?.content ?? '';

          if (chunk && !chunk.startsWith(accumulatedContent)) {
            accumulatedContent = chunk;
          }

          yield {
            model: parsed.model ?? selectedModel,
            createdAt: parsed.created_at ?? now,
            message: {
              role: ChatRole.assistant,
              content: accumulatedContent,
            },
            done: parsed.done ?? true,
          };
        } catch {}
      }
    })();
  }
}
