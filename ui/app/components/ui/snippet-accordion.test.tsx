import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Provider } from "./provider";
import { SnippetAccordion } from "./snippet-accordion";

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    systemTheme: 'light',
  }),
}));

const snippetBase = {
  _id: "123",
  text: "const x = 1 + 2;",
  summary: "",
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}

describe("SnippetAccordion", () => {
  it("shows loading state when summary is empty", () => {
    render(<SnippetAccordion {...snippetBase} />, { wrapper: Wrapper });

    expect(
      screen.getByText(/Content is being analyzed/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument(); // Spinner
  });

  it("shows summary when available", () => {
    const snippetWithSummary = {
      ...snippetBase,
      summary: "This is a summary.",
    };

    render(<SnippetAccordion {...snippetWithSummary} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText("This is a summary.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("expands and shows code", async () => {
    const snippetWithSummary = {
      ...snippetBase,
      summary: "Valid summary",
    };

    render(<SnippetAccordion {...snippetWithSummary} />, {
      wrapper: Wrapper,
    });

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(screen.getByText("const x = 1 + 2;")).toBeInTheDocument();
  });
});
