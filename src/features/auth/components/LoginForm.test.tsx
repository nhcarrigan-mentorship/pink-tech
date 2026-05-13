import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect } from "vitest";
import { renderWithProviders } from "../../../test/renderWithProviders";
import LoginForm from "./LoginForm";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../../shared/contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    uiCachedUser: null,
    isAuthenticated: false,
    sessionLoading: false,
    signup: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    deleteProfile: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email/password fields and submit button", () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("logs in when submitted", async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    renderWithProviders(<LoginForm />);

    const user = userEvent.setup();

    const email = "janedoe@email.com";
    const password = "9A%L^NmrYAnG%K";

    await user.type(screen.getByLabelText("Email Address"), email);
    await user.type(screen.getByLabelText("Password"), password);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockLogin).toHaveBeenCalledWith(email, password);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
