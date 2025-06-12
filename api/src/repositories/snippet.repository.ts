import { SnippetDocumentInterface } from "../types/snippet-document-interface.type";
import { SnippetModel } from "../types/snippet-model.type";


export class SnippetRepository {
  async getAll(): Promise<SnippetDocumentInterface[]> {
    return await SnippetModel.find().lean();
  }

  async getById(id: string): Promise<SnippetDocumentInterface | null> {
    return await SnippetModel.findById(id).lean();
  }

  async create(text: string, summary: string | null): Promise<SnippetDocumentInterface> {
    const snippet = new SnippetModel({ text, summary });
    return await snippet.save();
  }
}
