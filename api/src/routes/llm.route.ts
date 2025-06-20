import express from 'express';
import { LLMController } from '../controllers/llm.controller';
import { LLMService } from '../services/llm.service';


const llmRouter = express.Router();

const llmService = new LLMService();
const llmController = new LLMController(llmService);

llmRouter.post("/chat", llmController.chat.bind(llmController));
llmRouter.post("/chat/stream", llmController.chatStream.bind(llmController));


export default llmRouter;
