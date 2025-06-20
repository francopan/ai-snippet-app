import { TextGenerationMessage as TextMessage } from "../types/text-generation-message.type";
import { OllamaService } from "./ollama.service";
import { GeminiService } from "./gemini.service";
import { LLMResponse } from "../types/llm-response.tye";
import { ChatResult } from "../types/chat-result.type";

export class LLMService {
  private ollamaService = new OllamaService();
  private geminiService = new GeminiService();
  private defaultModel = "phi3";

  async generate(
    messages: TextMessage[],
    model?: string,
    stream = false
  ): Promise<LLMResponse> {
    const selectedModel = model ?? this.defaultModel;

    const rawResponse = this.isGeminiModel(selectedModel)
      ? await this.geminiService.generate(messages, selectedModel, stream)
      : await this.ollamaService.generate(messages, selectedModel, stream);

    const isAsyncIterable =
      typeof rawResponse === "object" &&
      rawResponse !== null &&
      Symbol.asyncIterator in rawResponse;

    if (!stream || !isAsyncIterable) {
      return JSON.stringify(rawResponse as ChatResult);
    }

    const streamResponse = rawResponse as AsyncGenerator<ChatResult>;
    return (async function* (): AsyncGenerator<string> {
      let previousContent = "";

      for await (const chunk of streamResponse) {
        console.log(chunk)
        const currentContent = chunk.message.content;
        const delta = currentContent.startsWith(previousContent)
          ? currentContent.slice(previousContent.length)
          : currentContent;

        previousContent = currentContent;

        yield JSON.stringify({ delta });
      }

      yield JSON.stringify({ done: true });
    })();
  }

  private isGeminiModel(model: string): boolean {
    return model.startsWith("gemini") || model.startsWith("models/gemini");
  }
}
