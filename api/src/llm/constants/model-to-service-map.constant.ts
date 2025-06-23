import { GeminiTextModel } from '../enums/gemini-text-models.enum';
import { ModelServiceProvider } from '../enums/model-service-provider.enum';
import { OllamaTextModel } from '../enums/ollama-text-models.enum';
import { OpenAITextModel } from '../enums/openai-text-models.enum';

export const modelToServiceMap: Record<string, ModelServiceProvider> = {
  // OpenAI
  [OpenAITextModel.GPT_3_5_TURBO]: ModelServiceProvider.OPENAI,
  [OpenAITextModel.GPT_4]: ModelServiceProvider.OPENAI,
  [OpenAITextModel.GPT_4_TURBO]: ModelServiceProvider.OPENAI,
  [OpenAITextModel.GPT_4_0125_PREVIEW]: ModelServiceProvider.OPENAI,
  [OpenAITextModel.GPT_4O]: ModelServiceProvider.OPENAI,
  [OpenAITextModel.TEXT_DAVINCI_003]: ModelServiceProvider.OPENAI,
  [OpenAITextModel.TEXT_CURIE_001]: ModelServiceProvider.OPENAI,
  [OpenAITextModel.TEXT_BABBAGE_001]: ModelServiceProvider.OPENAI,
  [OpenAITextModel.TEXT_ADA_001]: ModelServiceProvider.OPENAI,
  [OpenAITextModel.CODE_DAVINCI_002]: ModelServiceProvider.OPENAI,
  [OpenAITextModel.CODE_CUSHMAN_001]: ModelServiceProvider.OPENAI,

  // Gemini
  [GeminiTextModel.GEMINI_2_5_PRO]: ModelServiceProvider.GEMINI,
  [GeminiTextModel.GEMINI_2_5_FLASH]: ModelServiceProvider.GEMINI,
  [GeminiTextModel.GEMINI_1_5_PRO]: ModelServiceProvider.GEMINI,
  [GeminiTextModel.GEMINI_1_5_FLASH]: ModelServiceProvider.GEMINI,
  [GeminiTextModel.GEMINI_1_5_FLASH_8B]: ModelServiceProvider.GEMINI,
  [GeminiTextModel.GEMINI_2_0_FLASH]: ModelServiceProvider.GEMINI,
  [GeminiTextModel.GEMINI_2_0_FLASH_LITE]: ModelServiceProvider.GEMINI,
  [GeminiTextModel.GEMINI_2_0_FLASH_LIVE]: ModelServiceProvider.GEMINI,

  // Ollama
  [OllamaTextModel.LLAMA3]: ModelServiceProvider.OLLAMA,
  [OllamaTextModel.PHI3]: ModelServiceProvider.OLLAMA,
  [OllamaTextModel.PHI]: ModelServiceProvider.OLLAMA,
  [OllamaTextModel.DEEPSEEK_R1]: ModelServiceProvider.OLLAMA,
  [OllamaTextModel.TINY_LLAMA]: ModelServiceProvider.OLLAMA,
};
