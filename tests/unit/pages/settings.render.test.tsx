import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/settings/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: "1",
        email: "test@example.com",
        name: "Test User",
      },
    },
    status: "authenticated",
  })),
}));

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    user: {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      dateOfBirth: "1990-01-01",
    },
  }),
});

describe("SettingsPage (render)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders headings and sections without crashing", () => {
    render(<SettingsPage />);
    expect(screen.getByText(/Settings|הגדרות|settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile|פרופיל|profile/i)).toBeInTheDocument();
    expect(screen.getByText(/API Key|מפתח API|api key/i)).toBeInTheDocument();
    expect(screen.getByText(/Appearance|מראה|appearance/i)).toBeInTheDocument();
    expect(screen.getByText(/Language|שפה|language/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Notifications|התראות|notifications/i),
    ).toBeInTheDocument();
  });

  it("should display form inputs for user profile", async () => {
    render(<SettingsPage />);

    // Should have form inputs
    await waitFor(() => {
      expect(screen.getByLabelText(/name|שם/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email|מייל/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/date of birth|תאריך לידה/i),
      ).toBeInTheDocument();
    });
  });

  it("should handle form interactions", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/name|שם/i)).toBeInTheDocument();
    });

    // Should be able to type in form fields
    const nameInput = screen.getByLabelText(/name|שם/i);
    await user.type(nameInput, "New Name");

    expect(nameInput).toHaveValue("New Name");
  });

  it("should display dark mode toggle functionality", () => {
    render(<SettingsPage />);

    // Should have dark mode toggle
    expect(
      screen.getByText(/dark mode|מצב כהה|appearance/i),
    ).toBeInTheDocument();
  });

  it("should display language settings", () => {
    render(<SettingsPage />);

    // Should have language selection
    expect(screen.getByText(/language|שפה/i)).toBeInTheDocument();
  });

  it("should show API key section", () => {
    render(<SettingsPage />);

    // Should have API key section
    expect(screen.getByText(/API Key|מפתח API/i)).toBeInTheDocument();
  });
});
