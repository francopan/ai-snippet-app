import { Request } from 'express';

export type GetByIdRequest = Request<{ id: string }>;
export type CreateSnippetRequest = Request<{}, {}, { text: string }>;