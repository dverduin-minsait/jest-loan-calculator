import { render, screen } from "@testing-library/react";
import { DebtChart } from "@/components/dashboard/DebtChart";
import type { LoanData } from "@/lib/loan-calculations";

// Recharts relies on browser sizing APIs not available in jsdom
jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({
      children,
    }: {
      children: React.ReactNode;
    }) => <div data-testid="responsive-container">{children}</div>,
  };
});

const LOANS: LoanData[] = [
  { id: "loan-1", name: "Car Loan", amount: 10000, interest: 5, months: 12 },
  { id: "loan-2", name: "Mortgage", amount: 200000, interest: 3, months: 24 },
];

describe("DebtChart", () => {
  it("renders without crashing for empty loans array", () => {
    render(<DebtChart loans={[]} />);
    expect(screen.getByText(/no loan data/i)).toBeInTheDocument();
  });

  it("renders the responsive container for non-empty loans", () => {
    render(<DebtChart loans={LOANS} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("does not show 'no loan data' when loans are provided", () => {
    render(<DebtChart loans={LOANS} />);
    expect(screen.queryByText(/no loan data/i)).not.toBeInTheDocument();
  });
});
