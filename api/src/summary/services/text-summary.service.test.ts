import { LLMService } from '../../llm/services/llm/llm.service';
import { TextSummaryService } from './text-summary.service';
import { TextSummaryRepository } from '../repositories/text-summary.repository';
import { ChatRole } from '../../llm/enums/chat-role.enum';
import { ChatResultDeltaDto } from '../../llm/dtos/chat-result-delta.dto';

describe('TextSummaryService', () => {
  let service: TextSummaryService;
  let mockLLMService: jest.Mocked<LLMService>;
  let mockTextSummaryRepository: jest.Mocked<TextSummaryRepository>;

  beforeEach(() => {
    mockLLMService = {
      generate: jest.fn(),
    } as any;

    mockTextSummaryRepository = {
      create: jest.fn(),
      update: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      getPaginatedWithCount: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new TextSummaryService(mockLLMService, mockTextSummaryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper: async generator mock for streaming response
  async function* mockAsyncGenerator(messages: ChatResultDeltaDto[]) {
    for (const msg of messages) {
      await new Promise(res => setTimeout(res, 10)); // simulate async delay
      yield msg;
    }
  }

  it('should create a snippet and start streaming summary in background', async () => {
    const createdSnippet = {
      id: 'snippet123',
      text: 'some code',
      summary: null,
    };

    mockTextSummaryRepository.create.mockResolvedValue(createdSnippet);

    // Prepare the deltas that the LLM stream yields
    const deltas: ChatResultDeltaDto[] = [
      { message: { content: 'This ', role: ChatRole.assistant } },
      { message: { content: 'is ', role: ChatRole.assistant } },
      { message: { content: 'a ', role: ChatRole.assistant } },
      { message: { content: 'summary.', role: ChatRole.assistant } },
    ];

    // Mock generate to return async generator yielding deltas
    mockLLMService.generate.mockReturnValue(mockAsyncGenerator(deltas) as any);

    // Mock repository update to just resolve immediately
    mockTextSummaryRepository.update.mockResolvedValue({
      ...createdSnippet,
      summary: 'This is a summary.',
    });

    const result = await service.create({ text: 'some code' });

    expect(mockTextSummaryRepository.create).toHaveBeenCalledWith(
      'some code',
      undefined,
    );
    expect(result).toEqual(createdSnippet);

    // Wait a bit for the streaming to complete since it runs async
    await new Promise(r => setTimeout(r, 100));

    // It should call update multiple times with the growing summary
    expect(mockTextSummaryRepository.update).toHaveBeenCalledWith(
      'snippet123',
      { summary: 'This ' },
    );
    expect(mockTextSummaryRepository.update).toHaveBeenCalledWith(
      'snippet123',
      { summary: 'This is ' },
    );
    expect(mockTextSummaryRepository.update).toHaveBeenCalledWith(
      'snippet123',
      { summary: 'This is a ' },
    );
    expect(mockTextSummaryRepository.update).toHaveBeenCalledWith(
      'snippet123',
      { summary: 'This is a summary.' },
    );

    // The streams map should have an entry for this snippet id
    const streamState = service.getStreamStateById('snippet123');
    expect(streamState).toBeDefined();
    expect(streamState?.done).toBe(true);
  });

  it('should get all snippets', async () => {
    const mockSnippets = [{ id: '1', text: 'text', summary: 'summary' }];
    mockTextSummaryRepository.getAll.mockResolvedValue(mockSnippets);

    const result = await service.findAll();

    expect(mockTextSummaryRepository.getAll).toHaveBeenCalled();
    expect(result).toEqual(mockSnippets);
  });

  it('should get a snippet by ID', async () => {
    const mockSnippet = { id: '123', text: 'hi', summary: 'summary' };
    mockTextSummaryRepository.getById.mockResolvedValue(mockSnippet);

    const result = await service.findById('123');

    expect(mockTextSummaryRepository.getById).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockSnippet);
  });

  it('should update a snippet', async () => {
    const updated = { id: '123', text: 'new', summary: 'sum' };
    mockTextSummaryRepository.update.mockResolvedValue(updated);

    const result = await service.update('123', { text: 'new', summary: 'sum' });

    expect(mockTextSummaryRepository.update).toHaveBeenCalledWith('123', {
      text: 'new',
      summary: 'sum',
    });
    expect(result).toEqual(updated);
  });

  it('should delete a snippet', async () => {
    const deleted = { id: '123', text: 'old', summary: 'sum' };
    mockTextSummaryRepository.delete.mockResolvedValue(deleted);

    const result = await service.remove('123');

    expect(mockTextSummaryRepository.delete).toHaveBeenCalledWith('123');
    expect(result).toEqual(deleted);
  });

  it('should handle error during background summary generation', async () => {
    mockTextSummaryRepository.create.mockResolvedValue({
      id: 'error-id',
      text: 'bad text',
      summary: null,
    });
    // Simulate LLM generate throwing when called
    mockLLMService.generate.mockRejectedValue(new Error('fail'));

    // Spy on logger.error to check error logging
    const loggerErrorSpy = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation(() => {});

    // Trigger create, which internally calls startStreamingSummary that will fail
    await service.create({ text: 'bad text' });

    // Wait a bit to let the async background streaming run
    await new Promise(r => setTimeout(r, 50));

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Streaming failed for snippet error-id',
      expect.any(Error),
    );
  });
});
