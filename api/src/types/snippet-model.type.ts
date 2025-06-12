import mongoose from "mongoose";
import { SnippetDocumentInterface } from "./snippet-document-interface.type";
import { SnippetSchema } from "./snippet-schema.type";

export const SnippetModel = mongoose.model<SnippetDocumentInterface>('Snippet', SnippetSchema);
