import { render, screen, fireEvent } from "@testing-library/react";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

const TITLE = "Test Section";
const CONTENT = "Inner content";
const STORAGE_KEY = "collapsible:test-section";

beforeEach(() => {
  localStorage.clear();
});

describe("CollapsibleSection", () => {
  it("renders open by default and shows children", () => {
    render(<CollapsibleSection title={TITLE}>{CONTENT}</CollapsibleSection>);
    expect(screen.getByText(CONTENT)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(TITLE) })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("hides children when defaultOpen is false", () => {
    render(
      <CollapsibleSection title={TITLE} defaultOpen={false}>
        {CONTENT}
      </CollapsibleSection>
    );
    expect(screen.queryByText(CONTENT)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(TITLE) })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("toggles open/closed on click and writes to localStorage", () => {
    render(<CollapsibleSection title={TITLE}>{CONTENT}</CollapsibleSection>);
    const button = screen.getByRole("button", { name: new RegExp(TITLE) });

    // Collapse
    fireEvent.click(button);
    expect(screen.queryByText(CONTENT)).not.toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("false");

    // Re-expand
    fireEvent.click(button);
    expect(screen.getByText(CONTENT)).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("true");
  });

  it("restores collapsed state from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, "false");
    render(<CollapsibleSection title={TITLE}>{CONTENT}</CollapsibleSection>);
    expect(screen.queryByText(CONTENT)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(TITLE) })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("restores open state from localStorage even when defaultOpen is false", () => {
    localStorage.setItem(STORAGE_KEY, "true");
    render(
      <CollapsibleSection title={TITLE} defaultOpen={false}>
        {CONTENT}
      </CollapsibleSection>
    );
    expect(screen.getByText(CONTENT)).toBeInTheDocument();
  });
});
