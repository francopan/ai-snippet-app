import { Request, Response } from "express";
import { LLMService } from "../services/llm.service";
import { TextGenerationMessage } from "../types/text-generation-message.type";

export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  chat = async (req: Request, res: Response) => {
    try {
      const messages: TextGenerationMessage[] = req.body.messages;
      const model: string | undefined = req.body.model;

      if (!Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid or missing messages array" });
        return;
      }

      const reply = await this.llmService.generate(messages, model, false);
      res.json({ reply });
    } catch (error) {
      res.status(500).json({ message: "Error during LLM chat", error });
    }
  };

  chatStream = async (req: Request, res: Response): Promise<void> => {
    try {
      const messages: TextGenerationMessage[] = req.body.messages;
      const model: string | undefined = req.body.model;

      if (!Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid or missing messages array" });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const stream = await this.llmService.generate(messages, model, true);

      for await (const chunk of stream as AsyncGenerator<string>) {
        res.write(`data: ${chunk}\n\n`);
        res.flush();
      }

      res.write("event: done\ndata: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("LLM streaming error:", error);
      res.write("event: error\ndata: " + JSON.stringify(error) + "\n\n");
      res.end();
    }
  };
}
