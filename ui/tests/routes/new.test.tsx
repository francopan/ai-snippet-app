import { action } from "~/routes/new";

describe("action function", () => {
  beforeAll(() => {
    // Mock global fetch once before all tests
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
      json: async () => ({ snippet: { _id: snippetId, text: snippetText, summary: "summary" } }),
    });

    const request = new Request("http://localhost", {
      method: "POST",
      body: new URLSearchParams({ text: snippetText }),
    });

    const dummyContext = {} as any;

    const response = await action({ request, params: {}, context: dummyContext });

    if (
      !response ||
      typeof response !== "object" ||
      !("status" in response) ||
      !("headers" in response) ||
      typeof response.headers.get !== "function"
    ) {
      throw new Error("Expected response to be a Response-like object");
    }

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.PUBLIC_API_URL}/snippets`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: snippetText }),
      }),
    );
    
    // The redirect() function from Remix creates a Response object with HTTP status 302 (Found) by default.
    // This instructs the client to navigate (redirect) to the new URL (here: /${snippetId}).
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
  
    await expect(action({ request, params: {}, context: dummyContext })).rejects.toMatchObject({
      status: 500,
      statusText: expect.any(String), // optional
    });
  });  
});
