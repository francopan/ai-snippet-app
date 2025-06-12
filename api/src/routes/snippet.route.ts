import express from 'express';
import { SnippetController } from '../controllers/snippet.controller';

const snippetRouter = express.Router();

snippetRouter.get('/', SnippetController.getSnippets);      
snippetRouter.get('/:id', SnippetController.getSnippetById);
snippetRouter.post('/', SnippetController.createSnippet);

export default snippetRouter;
