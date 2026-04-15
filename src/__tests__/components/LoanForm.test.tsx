import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoanForm } from "@/components/loans/LoanForm";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, refresh: mockRefresh }),
}));

global.fetch = jest.fn();

describe("LoanForm (create mode)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all required fields", () => {
    render(<LoanForm />);
    expect(screen.getByLabelText(/loan name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/principal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/annual interest rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/term/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/partial amort/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total amort/i)).toBeInTheDocument();
  });

  it("shows 'Create loan' as submit button label", () => {
    render(<LoanForm />);
    expect(
      screen.getByRole("button", { name: /create loan/i })
    ).toBeInTheDocument();
  });

  it("calls POST /api/loans on submit with correct data", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "1",
        name: "Home",
        amount: 50000,
        interest: 3.5,
        months: 120,
        partialAmortRate: 0,
        totalAmortRate: 0,
      }),
    });

    render(<LoanForm />);
    fireEvent.change(screen.getByLabelText(/loan name/i), {
      target: { value: "Home" },
    });
    fireEvent.change(screen.getByLabelText(/principal/i), {
      target: { value: "50000" },
    });
    fireEvent.change(screen.getByLabelText(/annual interest rate/i), {
      target: { value: "3.5" },
    });
    fireEvent.change(screen.getByLabelText(/term/i), {
      target: { value: "120" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create loan/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/loans",
        expect.objectContaining({ method: "POST" })
      );
      expect(mockPush).toHaveBeenCalledWith("/loans");
    });
  });

  it("shows error message on failed submission", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Missing required fields" }),
    });

    render(<LoanForm />);
    fireEvent.change(screen.getByLabelText(/loan name/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/principal/i), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText(/annual interest rate/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/term/i), {
      target: { value: "12" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create loan/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /missing required fields/i
      );
    });
  });
});

describe("LoanForm (edit mode)", () => {
  const existingLoan = {
    id: "loan-1",
    name: "Car Loan",
    amount: 10000,
    interest: 5,
    partialAmortRate: 0,
    totalAmortRate: 0,
    months: 36,
  };

  it("pre-fills fields with existing loan data", () => {
    render(<LoanForm loan={existingLoan} />);
    expect(screen.getByLabelText(/loan name/i)).toHaveValue("Car Loan");
    expect(screen.getByLabelText(/principal/i)).toHaveValue(10000);
    expect(screen.getByLabelText(/term/i)).toHaveValue(36);
  });

  it("shows 'Update loan' as submit button label", () => {
    render(<LoanForm loan={existingLoan} />);
    expect(
      screen.getByRole("button", { name: /update loan/i })
    ).toBeInTheDocument();
  });

  it("calls PUT /api/loans/[id] on submit", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => existingLoan,
    });

    render(<LoanForm loan={existingLoan} />);
    fireEvent.click(screen.getByRole("button", { name: /update loan/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/loans/${existingLoan.id}`,
        expect.objectContaining({ method: "PUT" })
      );
    });
  });
});
