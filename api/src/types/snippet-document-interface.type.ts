import { Document } from "mongoose";

export interface SnippetDocumentInterface extends Document {
    text: string;
    summary: string | null;
}