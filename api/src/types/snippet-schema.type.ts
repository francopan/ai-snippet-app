import { Schema } from 'mongoose';
import { SnippetDocumentInterface } from './snippet-document-interface.type';

export const SnippetSchema = new Schema<SnippetDocumentInterface>(
  {
    text: { type: String, required: true },
    summary: { type: String, required: false },
  },
  { timestamps: true }
);

