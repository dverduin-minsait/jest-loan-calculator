import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { LoanCard } from "@/components/loans/LoanCard";

const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

global.fetch = jest.fn();

const LOAN = {
  id: "loan-1",
  name: "Car Loan",
  amount: 10000,
  interest: 5,
  partialAmortRate: 0,
  totalAmortRate: 0,
  months: 36,
};

describe("LoanCard delete flow", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the delete button", () => {
    render(<LoanCard loan={LOAN} />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("opens a confirmation dialog when Delete is clicked", () => {
    render(<LoanCard loan={LOAN} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // Confirm the loan name appears in the dialog message
    expect(within(dialog).getByText(/Car Loan/)).toBeInTheDocument();
  });

  it("does NOT call fetch when Cancel is clicked", () => {
    render(<LoanCard loan={LOAN} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /cancel/i }));
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls DELETE /api/loans/[id] and refreshes when confirmed", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<LoanCard loan={LOAN} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/loans/loan-1", { method: "DELETE" });
    });
    expect(mockRefresh).toHaveBeenCalled();
  });
});
