import { ChatRole } from "../enums/chat-role.enum";

export interface ChatMessage { role: ChatRole; content: string };