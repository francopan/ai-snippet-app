import { LLMService } from './llm.service';
import { ChatMessage } from '../types/chat-message.type';
import { ChatResult } from '../types/chat-result.type';
import { ChatRole } from '../enums/chat-role.enum';

global.fetch = jest.fn();

describe('LLMService', () => {
  const service = new LLMService();
  const messages: ChatMessage[] = [{ role: ChatRole.user, content: 'Hello' }];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a reply from the chat API', async () => {
    const mockReply = 'Hi there!';
    const mockResponse: ChatResult = {
        message: { role: ChatRole.assistant, content: mockReply },
        model: 'tinyllama',
        created_at: new Date().toString(),
        done: true,
        done_reason: '',
        eval_count: 18,
        eval_duration: 10,
        load_duration: 1,
        prompt_eval_count:1,
        prompt_eval_duration: 2,
        total_duration: 2
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await service.chat(messages);

    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'api_key': process.env.CHAT_API_KEY!,
      }),
      body: JSON.stringify({
        model: 'tinyllama',
        messages,
        stream: false,
      }),
    }));

    expect(result).toBe(mockReply);
  });

  it('should throw an error if response is not ok', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(service.chat(messages)).rejects.toThrow('Chat API error: 500 Internal Server Error');
  });

  it('should throw an error if message.content is missing', async () => {
    const mockResponse = { message: {} }; 

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    await expect(service.chat(messages)).rejects.toThrow('No reply found in Chat response');
  });

  it('should throw an error if fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(service.chat(messages)).rejects.toThrow('Network error');
  });
});
