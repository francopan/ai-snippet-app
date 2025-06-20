import { GoogleGenAI } from "@google/genai";
import { TextGenerationMessage } from "../types/text-generation-message.type";
import { ChatRole } from "../enums/chat-role.enum";
import { ChatResult } from "../types/chat-result.type";

export class GeminiService {
  private ai: GoogleGenAI;
  private model = "models/gemini-2.5-flash";

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
  }

  async generate(
    messages: TextGenerationMessage[],
    model?: string,
    stream: boolean = false
  ): Promise<ChatResult | AsyncGenerator<ChatResult>> {
    const selectedModel = model ?? this.model;
    const now = new Date().toISOString();

    const geminiMessages = messages.map((msg) => ({
      role:
        msg.role === ChatRole.user
          ? "user"
          : msg.role === ChatRole.system
          ? "system"
          : "model",
      parts: [{ text: msg.content }],
    }));

    if (!stream) {
      const result = await this.ai.models.generateContent({
        model: selectedModel,
        contents: geminiMessages,
      });

      return {
        model: selectedModel,
        created_at: now,
        message: { role: ChatRole.assistant, content: result.text ?? "" },
        done: true,
      };
    }

    const resultStream = await this.ai.models.generateContentStream({
      model: selectedModel,
      contents: geminiMessages,
    });

    async function* streamGenerator(): AsyncGenerator<ChatResult> {
      let accumulated = "";

      for await (const chunk of resultStream) {
        const text = chunk.text;
        if (text) {
          accumulated += text;
          yield {
            model: selectedModel,
            created_at: now,
            message: { role: ChatRole.assistant, content: accumulated },
            done: false,
          };
        }
      }

      yield {
        model: selectedModel,
        created_at: now,
        message: { role: ChatRole.assistant, content: accumulated },
        done: true,
      };
    }

    return streamGenerator();
  }
}
