import express from 'express';
import { SnippetController } from '../controllers/snippet.controller';
import { LLMService } from '../services/llm.service';
import { SnippetService } from '../services/snippet.service';

const snippetRouter = express.Router();

const llmService = new LLMService();
const snippetService = new SnippetService(llmService);
const snippetController = new SnippetController(snippetService);

snippetRouter.get('/', snippetController.getSnippets);
snippetRouter.get('/:id', snippetController.getSnippetById);
snippetRouter.post('/', snippetController.createSnippet);

export default snippetRouter;
