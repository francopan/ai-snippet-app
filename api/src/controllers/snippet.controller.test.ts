import { SnippetController } from './snippet.controller';
import { SnippetService } from '../services/snippet.service';
import { LLMService } from '../services/llm.service';
import { SnippetDocumentInterface } from '../types/snippet-document-interface.type';
import { CreateSnippetRequest, GetByIdRequest } from '../types/snippet-controller-requests.type';
import { Request } from 'express';

jest.mock('../services/snippet.service');

describe('SnippetController', () => {
  let controller: SnippetController;
  let snippetService: jest.Mocked<SnippetService>;
  let mockRes: any;

  const mockSnippet: Partial<SnippetDocumentInterface> = {
    _id: '1',
    text: 'AAAAAAAAAAAAA',
    summary: null,
  };

  beforeEach(() => {
    snippetService = new SnippetService({} as LLMService) as jest.Mocked<SnippetService>;
    controller = new SnippetController(snippetService);

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getSnippets', () => {
    it('should return all snippets', async () => {
      snippetService.getAllSnippets = jest.fn().mockResolvedValue([mockSnippet]);

      await controller.getSnippets({} as any, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith([mockSnippet]);
    });

    it('should return 500 if error occurs', async () => {
      snippetService.getAllSnippets = jest.fn().mockRejectedValue(new Error('fail'));

      await controller.getSnippets({} as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error fetching snippets',
        error: expect.any(Error),
      });
    });
  });

  describe('getSnippetById', () => {
    it('should return a snippet by ID', async () => {
      snippetService.getSnippetById = jest.fn().mockResolvedValue(mockSnippet);

      const mockReq = { params: { id: '1' } } as unknown as GetByIdRequest;

      await controller.getSnippetById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSnippet);
    });

    it('should return 404 if snippet not found', async () => {
      snippetService.getSnippetById = jest.fn().mockResolvedValue(null);

      const mockReq = { params: { id: '999' } } as unknown as GetByIdRequest;

      await controller.getSnippetById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Snippet not found',
        error: {},
      });
    });

    it('should return 500 if error occurs', async () => {
      snippetService.getSnippetById = jest.fn().mockRejectedValue(new Error('fail'));

      const mockReq = { params: { id: '1' } }  as unknown as GetByIdRequest;

      await controller.getSnippetById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error fetching snippet',
        error: expect.any(Error),
      });
    });
  });

  describe('createSnippet', () => {
    it('should create a snippet', async () => {
      snippetService.createSnippet = jest.fn().mockResolvedValue(mockSnippet);

      const mockReq = { body: { text: 'AAAAAAAAAAAAA' } } as CreateSnippetRequest;

      await controller.createSnippet(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Snippet created',
        snippet: mockSnippet,
      });
    });

    it('should return 500 if error occurs', async () => {
      snippetService.createSnippet = jest.fn().mockRejectedValue(new Error('fail'));

      const mockReq = { body: { text: 'AAAAAAAAAAAAA' } } as CreateSnippetRequest;

      await controller.createSnippet(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error creating snippet',
        error: expect.any(Error),
      });
    });
  });
});
