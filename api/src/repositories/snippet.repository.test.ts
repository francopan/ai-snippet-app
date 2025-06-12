import { SnippetDocumentInterface } from '../types/snippet-document-interface.type';
import { SnippetRepository } from './snippet.repository';
import { SnippetModel } from '../types/snippet-model.type';

jest.mock('../types/snippet-model.type', () => {
  return {
    SnippetModel: jest.fn(),
  };
});

describe('SnippetRepository', () => {
  const repository = new SnippetRepository();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all snippets', async () => {
    const mockSnippets: Partial<SnippetDocumentInterface>[] = [
      { _id: '1', text: 'code 1', summary: 'summary 1' },
    ];

    (SnippetModel as any).find = jest.fn().mockReturnValue({
      lean: () => mockSnippets,
    });

    const result = await repository.getAll();

    expect((SnippetModel as any).find).toHaveBeenCalled();
    expect(result).toEqual(mockSnippets);
  });

  it('should return a snippet by ID', async () => {
    const mockSnippet: Partial<SnippetDocumentInterface> = {
      _id: '123',
      text: 'code',
      summary: 'summary',
    };

    (SnippetModel as any).findById = jest.fn().mockReturnValue({
      lean: () => mockSnippet,
    });

    const result = await repository.getById('123');

    expect((SnippetModel as any).findById).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockSnippet);
  });

  it('should create and return a snippet', async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: 'abc',
      text: 'new code',
      summary: null,
    });

    const mockSnippetInstance = { save: mockSave };

    (SnippetModel as unknown as jest.Mock).mockImplementation(() => mockSnippetInstance);

    const repo = new SnippetRepository();
    const result = await repo.create('new code', null);

    expect(mockSave).toHaveBeenCalled();
    expect(result).toEqual({
      _id: 'abc',
      text: 'new code',
      summary: null,
    });
  });
});
