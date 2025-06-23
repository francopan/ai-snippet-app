import { ChatMessage } from '../../dtos/chat-message';
import { ChatRole } from '../../enums/chat-role.enum';
import { OllamaChatResult } from '../../types/ollama-chat-result.type';
import { OllamaService } from './ollama.service';

global.fetch = jest.fn();

function isAsyncGenerator(
  obj: any,
): obj is AsyncGenerator<
  ReturnType<typeof obj.next> extends Promise<infer R> ? R : unknown
> {
  return typeof obj?.[Symbol.asyncIterator] === 'function';
}

describe('OllamaService', () => {
  const service = new OllamaService();
  const messages: ChatMessage[] = [{ role: ChatRole.user, content: 'Hello' }];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a reply from the chat API (non-streaming)', async () => {
    const mockReply = 'Hi there!';
    const mockResponse: OllamaChatResult = {
      message: { role: ChatRole.assistant, content: mockReply },
      model: 'phi3',
      created_at: new Date().toISOString(),
      done: true,
      done_reason: '',
      eval_count: 18,
      eval_duration: 10,
      load_duration: 1,
      prompt_eval_count: 1,
      prompt_eval_duration: 2,
      total_duration: 2,
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await service.generate(messages);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          api_key: process.env.CHAT_API_KEY!,
        }),
        body: JSON.stringify({
          model: 'phi3',
          messages,
          stream: false,
        }),
      }),
    );

    expect(result).toEqual({
      model: mockResponse.model,
      createdAt: mockResponse.created_at,
      message: {
        role: ChatRole.assistant,
        content: mockReply,
      },
      done: mockResponse.done,
    });
  });

  it('should throw an error if response is not ok', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(service.generate(messages)).rejects.toThrow(
      'Chat API error: 500 Internal Server Error',
    );
  });

  it('should throw an error if message.content is missing', async () => {
    const mockResponse = { message: {} };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    await expect(service.generate(messages)).rejects.toThrow(
      'No reply found in Chat response',
    );
  });

  it('should throw an error if fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(service.generate(messages)).rejects.toThrow('Network error');
  });

  it('should return streamed chunks from chat API', async () => {
    // Simulated streamed JSON lines chunks
    const chunks = [
      JSON.stringify({
        model: 'phi3',
        created_at: new Date().toISOString(),
        message: { role: ChatRole.assistant, content: 'Hello' },
        done: false,
      }),
      JSON.stringify({
        model: 'phi3',
        created_at: new Date().toISOString(),
        message: { role: ChatRole.assistant, content: 'Hello, world!' },
        done: true,
      }),
    ];

    // Encode chunks with newline endings as typical in streaming
    const encoder = new TextEncoder();
    const encodedChunks = chunks.map(c => encoder.encode(c + '\n'));

    let callIndex = 0;
    const readerMock = {
      read: jest.fn().mockImplementation(() => {
        if (callIndex < encodedChunks.length) {
          return Promise.resolve({
            done: false,
            value: encodedChunks[callIndex++],
          });
        } else {
          return Promise.resolve({ done: true, value: undefined });
        }
      }),
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: {
        getReader: () => readerMock,
      },
    });

    const result = await service.generate(messages, true);

    if (!isAsyncGenerator(result)) {
      throw new Error('Expected an AsyncGenerator for streaming response');
    }

    expect(typeof result[Symbol.asyncIterator]).toBe('function');

    const results: any[] = [];
    for await (const chunk of result) {
      results.push(chunk);
    }

    expect(results.length).toBe(2);
    expect(results[0].message.content).toBe('Hello');
    expect(results[0].done).toBe(false);

    expect(results[1].message.content).toBe('Hello, world!');
    expect(results[1].done).toBe(true);
  });

  it('should throw error if reader is missing in streaming', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: {},
    });

    await expect(service.generate(messages, true)).rejects.toThrow(
      'Failed to get stream reader from response',
    );
  });
});
