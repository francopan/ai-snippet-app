import { SnippetService } from './snippet.service';
import { SnippetModel } from '../types/snippet-model.type';
import { LLMService } from './llm.service';
import { ChatRole } from '../enums/chat-role.enum';
import { SnippetDocumentInterface } from '../types/snippet-document-interface.type';

jest.mock('../types/snippet-model.type', () => ({
  SnippetModel: jest.fn(),
}));

describe('SnippetService', () => {
  let service: SnippetService;
  let mockLLMService: jest.Mocked<LLMService>;

  beforeEach(() => {
    mockLLMService = {
      chat: jest.fn(),
    } as unknown as jest.Mocked<LLMService>;

    service = new SnippetService(mockLLMService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a snippet and call summary generation in the background', async () => {
    const mockSavedSnippet = {
      _id: 'snippet123',
      text: 'some code',
      summary: null,
      save: jest.fn().mockResolvedValue({ _id: 'snippet123', text: 'some code', summary: null }),
    };

    (SnippetModel as unknown as jest.Mock).mockImplementation(() => mockSavedSnippet);

    const updateMock = jest.fn();
    (SnippetModel as any).findByIdAndUpdate = updateMock;

    mockLLMService.chat.mockResolvedValue('This is a summary.');

    const result = await service.createSnippet({ text: 'some code' });

    expect(result).toEqual({ _id: 'snippet123', text: 'some code', summary: null });
    expect(mockSavedSnippet.save).toHaveBeenCalled();
  });

  it('should get all snippets', async () => {
    const mockSnippets: Partial<SnippetDocumentInterface>[] = [
      { _id: '1', text: 'text', summary: 'summary'  },
    ];

    (SnippetModel as any).find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockSnippets),
    });

    const result = await service.getAllSnippets();

    expect(result).toEqual(mockSnippets);
  });

  it('should get a snippet by ID', async () => {
    const mockSnippet = { _id: '123', text: 'hi', summary: 'summary' };

    (SnippetModel as any).findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockSnippet),
    });

    const result = await service.getSnippetById('123');

    expect((SnippetModel as any).findById).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockSnippet);
  });

  it('should update a snippet', async () => {
    const updated = { _id: '123', text: 'new', summary: 'sum' };

    (SnippetModel as any).findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(updated),
    });

    const result = await service.updateSnippet('123', { text: 'new', summary: 'sum' });

    expect(result).toEqual(updated);
  });

  it('should delete a snippet', async () => {
    const deleted = { _id: '123', text: 'old', summary: 'sum' };

    (SnippetModel as any).findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(deleted),
    });

    const result = await service.deleteSnippet('123');

    expect(result).toEqual(deleted);
  });

  it('should handle error during background summary generation', async () => {
    const snippetId = 'err1';
    const text = 'fail summary';

    mockLLMService.chat.mockRejectedValue(new Error('fail'));

    (SnippetModel as any).findByIdAndUpdate = jest.fn();

    const result = await (service as any).generateSummaryInBackground(snippetId, text);

    expect(mockLLMService.chat).toHaveBeenCalledWith([
      {
        role: ChatRole.system,
        content: 'You are a strict summarizer. Summarize the following text in ~30 words or fewer.',
      },
      {
        role: ChatRole.user,
        content: text,
      },
    ]);

    expect(result).toBeUndefined();
  });
});
