import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIService } from './openai.service';

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'TEXT_API_KEY';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAIService],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
