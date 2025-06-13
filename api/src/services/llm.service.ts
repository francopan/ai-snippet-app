import { ChatMessage } from "../types/chat-message.type";
import { ChatResult } from "../types/chat-result.type";

export class LLMService {
    private apiKey = process.env.CHAT_API_KEY!;
    private model = "llama3";
    private apiUrl = "https://ollama.francopan.com.br/api/chat";
  
      
    async chat(messages: ChatMessage[], model?: string): Promise<string> {
        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api_key": this.apiKey,
                },
                body: JSON.stringify({
                    model: model ?? this.model,
                    messages,
                    stream: false,
                }),
            });
        
        
            if (!response.ok) {
                throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
            }
        
            const json = await response.json();
            const reply = (json as ChatResult).message.content

            if (!reply) {
                throw new Error("No reply found in Chat response");
            }
        
            return reply;
        
        } catch (error) {
            console.error("Fetch error:", error);
            throw error;
        }        
    }
}    