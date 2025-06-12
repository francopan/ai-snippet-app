import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "../../../app/components/ui/provider";
import { SnippetAccordion } from "../../../app/components/ui/snippet-accordion";

const snippet = {
  _id: "abc123",
  text: "console.log('Hello world');",
  summary: "Logs hello world",
  showLink: true,
};

function renderWithProviders(snippetProps: typeof snippet) {
  return render(
    <Provider>
      <MemoryRouter>
        <SnippetAccordion {...snippetProps} />
      </MemoryRouter>
    </Provider>
  );
}

describe("SnippetAccordion", () => {
  it("renders summary and code", () => {
    renderWithProviders(snippet);

    expect(screen.getByText("Logs hello world")).toBeInTheDocument();
    expect(screen.getByText("console.log('Hello world');")).toBeInTheDocument();
  });

  it("shows link button when showLink is true", () => {
    renderWithProviders(snippet);

    expect(screen.getByRole("button", { name: /go to snippet/i })).toBeInTheDocument();
  });

  it("does not show link button when showLink is false", () => {
    renderWithProviders({ ...snippet, showLink: false });

    expect(screen.queryByRole("button", { name: /go to snippet/i })).not.toBeInTheDocument();
  });

  it("shows loading state when summary is empty", () => {
    renderWithProviders({ ...snippet, summary: "" });

    expect(
      screen.getByText(/content is being analyzed\/summarized/i)
    ).toBeInTheDocument();
  });
});
