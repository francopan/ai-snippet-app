import { ChatRole } from '../enums/chat-role.enum';
import { TextGenerationMessage } from '../types/text-generation-message.type';
import { ChatResult } from '../types/chat-result.type';
import { OllamaChatResult } from '../types/ollama-chat-result.type';

export class OllamaService {
  private apiKey = process.env.CHAT_API_KEY!;
  private model = 'phi3';
  private apiUrl = 'https://ollama.francopan.com.br/api/chat';

  async generate(
    messages: TextGenerationMessage[],
    model?: string,
    stream = false
  ): Promise<ChatResult | AsyncGenerator<ChatResult>> {  // updated return type
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
      throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
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
        created_at: json.created_at ?? now,
        message: {
          role: ChatRole.assistant,
          content: reply,
        },
        done: json.done ?? true,
      };
    }
  
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
  
    if (!reader) {
      throw new Error('Failed to get stream reader from response');
    }
  
    return (async function* (): AsyncGenerator<ChatResult> {
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
              // Extract delta
              const delta = chunk.slice(accumulatedContent.length);
              accumulatedContent = chunk;
  
              yield {
                model: parsed.model ?? selectedModel,
                created_at: parsed.created_at ?? now,
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
                created_at: parsed.created_at ?? now,
                message: {
                  role: ChatRole.assistant,
                  content: accumulatedContent,
                },
                done: parsed.done ?? false,
              };
            }
          } catch (err) {
            console.warn('Failed to parse streamed chunk:', line);
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
            created_at: parsed.created_at ?? now,
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
