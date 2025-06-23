import { action } from "~/routes/new";

describe("action function", () => {
  beforeAll(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("posts snippet text and redirects on success", async () => {
    const snippetId = "abc123";
    const snippetText = "AAAAAAAAAAA";

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: snippetId, text: snippetText, summary: "summary" }),
    });

    const request = new Request("http://localhost", {
      method: "POST",
      body: new URLSearchParams({ text: snippetText }),
    });

    const dummyContext = {} as any;

    // Mock environment variable used in action
    process.env.VITE_PUBLIC_API_URL = "http://api.test";

    const response = (await action({ request, params: {}, context: dummyContext })) as Response;

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.VITE_PUBLIC_API_URL}/snippets`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: snippetText }),
      }),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(`/${snippetId}`);
    
  });

  it("throws Response with error status if fetch response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const snippetText = "BBBBBBBBBBB";

    const request = new Request("http://localhost", {
      method: "POST",
      body: new URLSearchParams({ text: snippetText }),
    });

    const dummyContext = {} as any;

    process.env.VITE_PUBLIC_API_URL = "http://api.test";

    await expect(action({ request, params: {}, context: dummyContext })).rejects.toMatchObject({
      status: 500,
    });
  });
});
