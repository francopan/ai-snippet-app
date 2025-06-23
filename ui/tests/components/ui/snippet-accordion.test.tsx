jest.mock("../../../app/constants/api-config.constant", () => ({
  API_URL: "http://localhost:3000",
}));


import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "../../../app/components/ui/provider";
import { SnippetAccordion } from "../../../app/components/ui/snippet-accordion";

// Silence React Router future flag warnings during tests
jest.spyOn(console, "warn").mockImplementation((msg) => {
  if (
    typeof msg === "string" &&
    (msg.includes("React Router Future Flag Warning") ||
     msg.includes("Relative route resolution within Splat routes is changing"))
  ) {
    return;
  }
  console.warn(msg);
});


// Mock EventSource globally for tests
class MockEventSource {
  constructor(url: string) {}
  close() {}
}
global.EventSource = MockEventSource as any;

process.env.VITE_PUBLIC_API_URL = "http://localhost:4000";

const snippet = {
  id: "abc123",
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

  it("shows link button when showLink is true", async () => {
    renderWithProviders(snippet);

    // Expand accordion to reveal content
    const accordionTrigger = screen.getByRole("button", { name: /logs hello world/i });
    await userEvent.click(accordionTrigger);

    expect(screen.getByRole("button", { name: /go to snippet/i })).toBeInTheDocument();
  });

  it("does not show link button when showLink is false", async () => {
    renderWithProviders({ ...snippet, showLink: false });

    const accordionTrigger = screen.getByRole("button", { name: /logs hello world/i });
    await userEvent.click(accordionTrigger);

    expect(screen.queryByRole("button", { name: /go to snippet/i })).not.toBeInTheDocument();
  });

  it("shows loading spinner and loading text when summary is empty", () => {
    renderWithProviders({ ...snippet, summary: "" });
    const accordionTrigger = screen.getByRole("button", { name: /summarizing.../i });
    const spinner = within(accordionTrigger).getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(accordionTrigger).toHaveTextContent(/summarizing.../i);
    
  });
});
