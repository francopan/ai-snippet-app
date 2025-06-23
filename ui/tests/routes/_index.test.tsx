import * as remix from "@remix-run/react";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "~/components/ui/provider";
import Index, { loader } from "../../app/routes/_index";

const mockPaginatedData = {
  page: 1,
  limit: 5,
  totalItems: 2,
  totalPages: 1,
  items: [
    { id: "1", text: "console.log('One');", summary: "Log one" },
    { id: "2", text: "console.log('Two');", summary: "Log two" },
  ],
};

jest.mock("~/components/ui/snippet-accordion", () => ({
  SnippetAccordion: ({ summary, id, text, showLink }: any) => (
    <div data-testid="snippet-accordion">
      <div>{summary}</div>
      <div>{text}</div>
      {showLink && <button>Go to snippet</button>}
    </div>
  ),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <Provider>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
}

describe("Index Page", () => {
  beforeEach(() => {
    process.env.VITE_PUBLIC_API_URL = "http://localhost:3000";
    jest.spyOn(remix, "useLoaderData").mockReturnValue(mockPaginatedData);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.VITE_PUBLIC_API_URL;
  });

  it("renders heading and create button", () => {
    renderWithProviders(<Index />);
    expect(screen.getByRole("heading", { name: /snippets/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create new snippet/i })).toBeInTheDocument();
  });

  it("renders SnippetAccordion for each snippet", () => {
    renderWithProviders(<Index />);
    const accordions = screen.getAllByTestId("snippet-accordion");
    expect(accordions).toHaveLength(mockPaginatedData.items.length);

    mockPaginatedData.items.forEach((snippet) => {
      expect(screen.getByText(snippet.summary)).toBeInTheDocument();
      expect(screen.getByText(snippet.text)).toBeInTheDocument();
    });
  });
});

describe("loader", () => {
  beforeEach(() => {
    process.env.VITE_PUBLIC_API_URL = "http://localhost:3000";
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.VITE_PUBLIC_API_URL;
  });

  it("fetches snippets and returns json", async () => {
    const mockResponse = {
      page: 1,
      limit: 5,
      totalItems: 2,
      totalPages: 1,
      items: [{ id: "123", text: "console.log('test');", summary: "Test snippet" }],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const request = new Request("http://localhost:3000/snippets?page=1&limit=5");

    const response = await loader({
      request,
      params: {},
      context: {} as any,
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/snippets/paginated?page=1&limit=5"
    );

    if (!(response instanceof Response)) {
      throw new Error("Unexpected loader return value");
    }
    const data = await response.json();
    expect(data).toEqual(mockResponse);
  });

  it("throws on fetch failure", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: jest.fn(),
    });

    const request = new Request("http://localhost:3000/snippets?page=1&limit=5");

    await expect(
      loader({ request, params: {}, context: {} as any })
    ).rejects.toMatchObject({
      status: 500,
    });
  });
});
