import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Suppress console.error from React for expected errors in tests
const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
afterAll(() => consoleSpy.mockRestore());

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test error message");
  return <div>OK</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error message/i)).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });
});
