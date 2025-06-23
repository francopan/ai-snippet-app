import { Module } from '@nestjs/common';
import { OllamaService } from './services/ollama/ollama.service';
import { GeminiService } from './services/gemini/gemini.service';
import { LLMService } from './services/llm/llm.service';
import { LLMController } from './controllers/llm.controller';
import { OpenAIService } from './services/openai/openai.service';

@Module({
  providers: [LLMService, OllamaService, GeminiService, OpenAIService],
  controllers: [LLMController],
  exports: [LLMService],
})
export class LLMModule {}
