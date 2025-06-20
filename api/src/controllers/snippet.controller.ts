import { Request, Response } from 'express';
import { SnippetService } from '../services/snippet.service';
import { CreateSnippetRequest, GetByIdRequest } from '../types/snippet-controller-requests.type';

export class SnippetController {
  constructor(private readonly snippetService: SnippetService) {}

  getSnippets = async (req: Request, res: Response) => {
    try {
      const snippets = await this.snippetService.getAllSnippets();
      res.json(snippets);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching snippets', error });
    }
  };

  getSnippetById = async (req: GetByIdRequest, res: Response) => {
    try {
      const snippet = await this.snippetService.getSnippetById(req.params.id);
      if (!snippet) {
        res.status(404).json({ message: 'Snippet not found', error: {} });
        return;
      }
      res.status(200).json(snippet);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching snippet', error });
    }
  };

  createSnippet = async (req: CreateSnippetRequest, res: Response) => {
    try {
      const { text } = req.body;
      const newSnippet = await this.snippetService.createSnippet({ text });

      res.status(201).json({ message: 'Snippet created', snippet: newSnippet });
    } catch (error) {
      res.status(500).json({ message: 'Error creating snippet', error });
    }
  };
}
