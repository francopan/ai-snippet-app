import { SnippetController } from './snippet.controller';
import { SnippetService } from '../services/snippet.service';
import { LLMService } from '../services/llm.service';
import { SnippetDocumentInterface } from '../types/snippet-document-interface.type';
import { CreateSnippetRequest } from '../types/snippet-controller-requests.type';

jest.mock('../services/snippet.service');

const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

const mockRes = {
  json: mockJson,
  status: mockStatus,
} as any;

describe('SnippetController', () => {
  const snippetService = new SnippetService({} as LLMService);
  
  const mockSnippet: Partial<SnippetDocumentInterface> = {
    _id: '1',
    text: 'AAAAAAAAAAAAA',
    summary: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (SnippetController as any).prototype.snippetService = snippetService;
    (SnippetService as unknown as jest.Mock).mockImplementation(() => snippetService);
  });

  describe('getSnippets', () => {
    it('should return all snippets', async () => {
      jest.spyOn(snippetService, 'getAllSnippets').mockResolvedValue([mockSnippet as SnippetDocumentInterface]);

      await SnippetController.getSnippets({} as any, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith([mockSnippet]);
    });

    it('should return 500 if error occurs', async () => {
      jest.spyOn(snippetService, 'getAllSnippets').mockRejectedValue(new Error('fail'));

      await SnippetController.getSnippets({} as any, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Error fetching snippets', error: expect.any(Error) });
    });
  });

  describe('getSnippetById', () => {
    it('should return a snippet by ID', async () => {
      jest.spyOn(snippetService, 'getSnippetById').mockResolvedValue(mockSnippet as SnippetDocumentInterface);

      const mockReq = { params: { id: '1' } } as any;

      await SnippetController.getSnippetById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.status().json).toHaveBeenCalledWith(mockSnippet);
    });

    it('should return 404 if snippet not found', async () => {
      jest.spyOn(snippetService, 'getSnippetById').mockResolvedValue(null);

      const mockReq = { params: { id: '999' } } as any;

      await SnippetController.getSnippetById(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Snippet not found', error: {} });
    });

    it('should return 500 if error occurs', async () => {
      jest.spyOn(snippetService, 'getSnippetById').mockRejectedValue(new Error('fail'));

      const mockReq = { params: { id: '1' } } as any;

      await SnippetController.getSnippetById(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Error fetching snippet', error: expect.any(Error) });
    });
  });

  describe('createSnippet', () => {
    it('should create a snippet', async () => {
      jest.spyOn(snippetService, 'createSnippet').mockResolvedValue(mockSnippet as SnippetDocumentInterface);

      const mockReq = { body: { text: 'AAAAAAAAAAAAA' } } as any;

      await SnippetController.createSnippet(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Snippet created', snippet: mockSnippet });
    });

    it('should return 500 if error occurs', async () => {
      jest.spyOn(snippetService, 'createSnippet').mockRejectedValue(new Error('fail'));

      const mockReq = { body: { text: 'AAAAAAAAAAAAA' } } as CreateSnippetRequest;

      await SnippetController.createSnippet(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Error creating snippet', error: expect.any(Error) });
    });
  });
});
