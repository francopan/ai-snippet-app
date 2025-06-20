import { ChatRole } from "../enums/chat-role.enum";

export interface TextGenerationMessage { role: ChatRole; content: string };