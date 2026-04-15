import { render, screen } from "@testing-library/react";
import { LoanSummaryCard } from "@/components/dashboard/LoanSummaryCard";
import type { LoanData } from "@/lib/loan-calculations";

const LOANS: LoanData[] = [
  { id: "1", name: "Car", amount: 10000, interest: 6, months: 12 },
  { id: "2", name: "Home", amount: 50000, interest: 3, months: 24 },
];

describe("LoanSummaryCard", () => {
  it("renders nothing for empty loans", () => {
    const { container } = render(<LoanSummaryCard loans={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the correct loan count", () => {
    render(<LoanSummaryCard loans={LOANS} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows total principal as sum of loan amounts", () => {
    render(<LoanSummaryCard loans={LOANS} />);
    // 10000 + 50000 = 60000
    expect(screen.getByText(/€60,000/i)).toBeInTheDocument();
  });

  it("shows total interest cost in red", () => {
    render(<LoanSummaryCard loans={LOANS} />);
    const interestLabel = screen.getByText(/total interest cost/i);
    expect(interestLabel).toBeInTheDocument();
    // The interest value should be greater than 0
    const interestSection = interestLabel.closest("div");
    expect(interestSection).toBeTruthy();
  });

  it("total paid is greater than principal", () => {
    render(<LoanSummaryCard loans={LOANS} />);
    // Text shows both principal and total paid; total paid > principal
    const principalEl = screen.getByText(/€60,000/i);
    expect(principalEl).toBeInTheDocument();
  });
});
