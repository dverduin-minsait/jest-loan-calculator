import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "@/components/auth/LoginForm";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockSignIn = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email and password fields and a submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows an error when credentials are invalid", async () => {
    mockSignIn.mockResolvedValueOnce({ error: "CredentialsSignin" });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bad@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /invalid email or password/i
      );
    });
  });

  it("redirects to /dashboard on successful login", async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ok@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "correctpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("disables the submit button while submitting", async () => {
    // Never resolves so we can check intermediate state
    mockSignIn.mockReturnValueOnce(new Promise(() => {}));

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ok@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "correctpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
