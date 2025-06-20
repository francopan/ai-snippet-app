import { ChatRole } from "../enums/chat-role.enum";

export interface ChatResult {
    model: string;
    created_at: string;
    message: {
      role: ChatRole.assistant;
      content: string;
    };
    done: boolean;
}
  