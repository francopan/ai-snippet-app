import * as remix from "@remix-run/react";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "~/components/ui/provider";
import Index, { loader } from "../../app/routes/_index";


const mockSnippets = [
  { _id: "1", text: "console.log('One');", summary: "Log one", showLink: true },
  { _id: "2", text: "console.log('Two');", summary: "Log two", showLink: true },
];

jest.mock("~/components/ui/snippet-accordion", () => ({
  SnippetAccordion: ({ summary, _id, text, showLink }: any) => (
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
    jest.spyOn(remix, "useLoaderData").mockReturnValue(mockSnippets);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders heading and create button", () => {
    renderWithProviders(<Index />);

    expect(screen.getByRole("heading", { name: /snippets/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create new snippet/i })).toBeInTheDocument();
  });

  it("renders SnippetAccordion for each snippet", () => {
    renderWithProviders(<Index />);

    const accordions = screen.getAllByTestId("snippet-accordion");
    expect(accordions).toHaveLength(mockSnippets.length);

    mockSnippets.forEach((snippet) => {
      expect(screen.getByText(snippet.summary)).toBeInTheDocument();
      expect(screen.getByText(snippet.text)).toBeInTheDocument();
    });
  });
});

describe("loader", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("fetches snippets and returns json", async () => {
    const mockResponse = [{ _id: "123", text: "console.log('test');", summary: "Test snippet" }];
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await loader({
      request: new Request("http://localhost:3000/snippets"),
      params: {},
      context: {},
    });

    expect(fetch).toHaveBeenCalledWith(`${process.env.PUBLIC_API_URL}/snippets`);
  
  });
});
