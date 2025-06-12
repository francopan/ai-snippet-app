import * as remix from "@remix-run/react";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "~/components/ui/provider";
import SnippetView from "~/routes/$id";
import { loader } from "../../app/routes/$id";


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

describe("SnippetView Component", () => {
  const mockSnippet = {
    _id: "123",
    summary: "Test summary",
    text: "console.log('test');",
    showLink: false,
  };

  beforeEach(() => {
    jest.spyOn(remix, "useLoaderData").mockReturnValue(mockSnippet);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the Back button and heading", () => {
    renderWithProviders(<SnippetView />);

    expect(screen.getByRole("button", { name: /← back/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /snippet detail/i })).toBeInTheDocument();
  });

  it("renders SnippetAccordion with snippet data", () => {
    renderWithProviders(<SnippetView />);

    const accordion = screen.getByTestId("snippet-accordion");
    expect(accordion).toBeInTheDocument();
    expect(screen.getByText(mockSnippet.summary)).toBeInTheDocument();
    expect(screen.getByText(mockSnippet.text)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /go to snippet/i })).not.toBeInTheDocument();
  });
});

describe("loader function", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("fetches a snippet by id and returns json", async () => {
    const mockResponse = {
      _id: "abc",
      summary: "Summary abc",
      text: "console.log('abc');",
      showLink: false,
    };
  
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });
  
    const params = { id: "abc" };
    const request = new Request("http://localhost/snippets/abc");
  
    const result = (await loader({ params, request, context: {} })) as Response;
    const data = await result.json();
  
    expect(fetch).toHaveBeenCalledWith(`${process.env.PUBLIC_API_URL}/snippets/abc`);
    expect(data).toEqual(mockResponse);
  });
  
});
