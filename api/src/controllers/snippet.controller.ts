import { LLMService } from '../services/llm.service';
import { SnippetService } from '../services/snippet.service';
import { GetByIdRequest, CreateSnippetRequest } from '../types/snippet-controller-requests.type';
import { Request, Response } from 'express';

const llmService = new LLMService();
const snippetService = new SnippetService(llmService);

export class SnippetController {
  static async getSnippets(req: Request, res: Response) {
    try {
      const snippets = await snippetService.getAllSnippets();
      res.json(snippets);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching snippets', error });
    }
  }

  static async getSnippetById(req: GetByIdRequest, res: Response) {
    try {
      const snippet = await snippetService.getSnippetById(req.params.id);
  
      if (!snippet) {
        res.status(404).json({ message: 'Snippet not found', error: {} });
        return;
      }
  
      res.status(200).json(snippet);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching snippet', error });
    }
  }  

  static async createSnippet(req: CreateSnippetRequest, res: Response) {
    try {
      const { text } = req.body;
      const newSnippet = await snippetService.createSnippet({ text });

      res.status(201).json({ message: 'Snippet created', snippet: newSnippet });
    } catch (error) {
      res.status(500).json({ message: 'Error creating snippet', error });
    }
  }
}
