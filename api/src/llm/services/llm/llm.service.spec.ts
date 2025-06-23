import { Test, TestingModule } from '@nestjs/testing';
import { LLMService } from './llm.service';
import { OllamaService } from '../ollama/ollama.service';
import { GeminiService } from '../gemini/gemini.service';
import { OpenAIService } from '../openai/openai.service';

describe('LLMService', () => {
  let service: LLMService;

  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'TEXT_API_KEY';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LLMService, OllamaService, GeminiService, OpenAIService],
    }).compile();

    service = module.get<LLMService>(LLMService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { ChatMessage } from '../../dtos/chat-message';
// import { ChatResultDto } from '../../dtos/chat-result.dto';
// import { ChatRole } from '../../enums/chat-role.enum';
// import { OllamaTextModel } from '../../enums/ollama-text-models.enum';
// import { GeminiService } from '../gemini/gemini.service';
// import { OllamaService } from '../ollama/ollama.service';
// import { OpenAIService } from '../openai/openai.service';
// import { LLMService } from './llm.service';

// describe('LLMService', () => {
//   let service: LLMService;
//   let geminiService: Partial<GeminiService>;
//   let ollamaService: Partial<OllamaService>;
//   let openAIService: Partial<OpenAIService>;

//   beforeEach(async () => {
//     geminiService = { generate: jest.fn() };
//     ollamaService = { generate: jest.fn() };
//     openAIService = { generate: jest.fn() };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         LLMService,
//         { provide: GeminiService, useValue: geminiService },
//         { provide: OllamaService, useValue: ollamaService },
//         { provide: OpenAIService, useValue: openAIService },
//       ],
//     }).compile();

//     service = module.get<LLMService>(LLMService);

//     (service as any).modelToServiceMap = {
//       'models/gemini-2.5-pro': geminiService,
//       'gpt-4': openAIService,
//       'phi3': ollamaService,
//       [OllamaTextModel.PHI3.toString()]: ollamaService,
//     };
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('getModelService', () => {
//     it('returns the GeminiService for GEMINI provider', () => {
//       const model = 'models/gemini-2.5-pro';
//       expect(service['getModelService'](model)).toBe(geminiService);
//     });

//     it('returns the OpenAIService for OPENAI provider', () => {
//       const model = 'gpt-4';
//       expect(service['getModelService'](model)).toBe(openAIService);
//     });

//     it('returns the OllamaService for OLLAMA provider', () => {
//       const model = OllamaTextModel.PHI3.toString();
//       expect(service['getModelService'](model)).toBe(ollamaService);
//     });

//     it('throws BadRequestException on unknown model', () => {
//       expect(() => service['getModelService']('unknown-model')).toThrow();
//     });
//   });

//   describe('generate', () => {
//     const messages: ChatMessage[] = [{ role: ChatRole.user, content: 'Hello' }];

//     it('calls generate on the correct service and returns non-stream response', async () => {
//       const model = OllamaTextModel.PHI3.toString();

//       const fakeResponse: ChatResultDto = {
//         model,
//         createdAt: new Date().toISOString(),
//         done: false,
//         message: {
//           role: ChatRole.assistant,
//           content: 'Hi there',
//         },
//       };

//       (ollamaService.generate as jest.Mock).mockResolvedValue(fakeResponse);

//       const result = await service.generate(messages, model, false);

//       expect(ollamaService.generate).toHaveBeenCalledWith(messages, false, model);
//       expect(result).toEqual(fakeResponse);
//     });

//     it('streams and yields delta chunks correctly', async () => {
//       const model = OllamaTextModel.PHI3.toString();

//       async function* mockStream(): AsyncGenerator<ChatResultDto> {
//         yield {
//           model,
//           createdAt: new Date().toISOString(),
//           done: false,
//           message: { role: ChatRole.assistant, content: 'Hello' },
//         };
//         yield {
//           model,
//           createdAt: new Date().toISOString(),
//           done: false,
//           message: { role: ChatRole.assistant, content: ' world' },
//         };
//         yield {
//           model,
//           createdAt: new Date().toISOString(),
//           done: true,
//           message: { role: ChatRole.assistant, content: '' },
//         };
//       }

//       (ollamaService.generate as jest.Mock).mockResolvedValue(mockStream() as any);

//       const stream = await service.generate(messages, model, true);

//       expect(typeof (stream as AsyncIterable<ChatResultDto>)[Symbol.asyncIterator]).toBe('function');

//       const results: Array<{ done: boolean; message: { role: ChatRole; content: string } }> = [];
//       for await (const chunk of stream as AsyncIterable<any>) {
//         results.push(chunk);
//       }

//       expect(results).toEqual([
//         { done: false, message: { role: ChatRole.assistant, content: 'Hello' } },
//         { done: false, message: { role: ChatRole.assistant, content: ' world' } },
//         { done: true, message: { role: ChatRole.assistant, content: '' } },
//       ]);
//     });

//     it('returns raw response if streaming but response is not async iterable', async () => {
//       const model = OllamaTextModel.PHI3.toString();

//       const fakeResponse: ChatResultDto = {
//         model,
//         createdAt: new Date().toISOString(),
//         done: false,
//         message: {
//           role: ChatRole.assistant,
//           content: 'Non-streaming response',
//         },
//       };

//       (ollamaService.generate as jest.Mock).mockResolvedValue(fakeResponse);

//       const result = await service.generate(messages, model, true);

//       expect(result).toEqual(fakeResponse);
//     });
//   });
// });
