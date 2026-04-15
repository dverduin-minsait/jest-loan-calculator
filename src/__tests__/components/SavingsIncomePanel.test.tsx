import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SavingsIncomePanel } from "@/components/dashboard/SavingsIncomePanel";

const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

global.fetch = jest.fn();

const DEFAULT_PROPS = { userId: "user-1", initialSavings: 1000, initialIncome: 2000, initialInflationRate: 0 };

describe("SavingsIncomePanel", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders savings and income inputs with initial values", () => {
    render(<SavingsIncomePanel {...DEFAULT_PROPS} />);
    expect(screen.getByLabelText(/savings/i)).toHaveValue(1000);
    expect(screen.getByLabelText(/monthly income/i)).toHaveValue(2000);
  });

  it("shows 'Saved ✓' and calls router.refresh on success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<SavingsIncomePanel {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("Saved ✓");
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows error message and does NOT show 'Saved ✓' when fetch fails", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Forbidden" }),
    });

    render(<SavingsIncomePanel {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/forbidden/i);
    });
    expect(screen.getByRole("button")).not.toHaveTextContent("Saved ✓");
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
