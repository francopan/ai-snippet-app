import { ChatRole } from "../enums/chat-role.enum";
import { ChatMessage } from "../types/chat-message.type";
import { SnippetDocumentInterface } from "../types/snippet-document-interface.type";
import { SnippetModel } from "../types/snippet-model.type";
import { LLMService } from "./llm.service";

export class SnippetService {

    private llmService: LLMService;

    constructor(llmService: LLMService) {
        this.llmService = llmService;
    }
 
  async createSnippet(data: { text: string }): Promise<SnippetDocumentInterface> {
    const snippet = new SnippetModel({
        text: data.text,
        summary: null,
    });

    const savedSnippet = await snippet.save();

    this.generateSummaryInBackground(savedSnippet._id as string, data.text);

    return savedSnippet;
  }
    
     

  async getAllSnippets(): Promise<SnippetDocumentInterface[]> {
    return await SnippetModel.find().exec();
  }

  async getSnippetById(id: string): Promise<SnippetDocumentInterface | null> {
    return await SnippetModel.findById(id).exec();
  }

  async updateSnippet(id: string, data: Partial<{ text: string; summary: string }>): Promise<SnippetDocumentInterface | null> {
    return await SnippetModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteSnippet(id: string): Promise<SnippetDocumentInterface | null> {
    return await SnippetModel.findByIdAndDelete(id).exec();
  }

  private async generateSummaryInBackground(snippetId: string, text: string) {
    try {
        const messages: Array<ChatMessage> = [
            {
                role: ChatRole.system,
                content: "You are a strict summarizer. Summarize the following text in ~30 words or fewer."
            },
            {
                role: ChatRole.user,
                content: text
            }
        ];

        const summary = await this.llmService.chat(messages);

        await SnippetModel.findByIdAndUpdate(snippetId, { summary });
    } catch (err) {
        console.error(`Failed to generate summary for snippet ${snippetId}`, err);
    }
}

}
