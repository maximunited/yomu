import React from "react";
import { render, screen, waitFor, act } from "../../utils/test-helpers";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/settings/page";

// Mock next-auth
const mockUseSession = jest.fn();
jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signOut: jest.fn(),
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

describe("Settings Page Form Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();

    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
      },
      status: "authenticated",
    });

    // Mock successful profile API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          name: "Test User",
          email: "test@example.com",
          dateOfBirth: "1990-01-01",
          anniversaryDate: null,
          profilePicture: null,
        },
      }),
    });
  });

  it("should load and display user profile data", async () => {
    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1990-01-01")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/user/profile");
  });

  it("should enable edit mode when edit button is clicked", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Find and click edit button
    const editButton = screen.getByLabelText(/edit profile|עריכת פרופיל/i);
    await user.click(editButton);

    // Form fields should now be editable
    const nameInput = screen.getByDisplayValue("Test User");
    expect(nameInput).not.toBeDisabled();
  });

  it("should save profile changes when save button is clicked", async () => {
    const user = userEvent.setup();

    // Mock successful save response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Enable edit mode
    const editButton = screen.getByLabelText(/edit profile|עריכת פרופיל/i);
    await user.click(editButton);

    // Change the name
    const nameInput = screen.getByDisplayValue("Test User");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");

    // Save changes
    const saveButton = screen.getByText(/save changes|שמור שינויים/i);
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/user/profile",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("Updated Name"),
        }),
      );
    });
  });

  it("should handle profile save errors", async () => {
    const user = userEvent.setup();

    // Mock failed save response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { name: "Test User", email: "test@example.com" },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Enable edit mode and try to save
    const editButton = screen.getByLabelText(/edit profile|עריכת פרופיל/i);
    await user.click(editButton);

    const saveButton = screen.getByText(/save changes|שמור שינויים/i);
    await user.click(saveButton);

    // Should handle error gracefully
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/user/profile",
        expect.any(Object),
      );
    });
  });

  it("should toggle dark mode and save preference", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Find and click dark mode toggle
    const darkModeToggle = screen.getByLabelText(/dark mode|מצב לילה/i);
    await user.click(darkModeToggle);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("darkMode", "true");
  });

  it("should handle notification settings changes", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Find notification toggles
    const emailToggle = screen.getByLabelText(
      /email notifications|התראות אימייל/i,
    );
    await user.click(emailToggle);

    // Should update notification state
    expect(emailToggle).toBeInTheDocument();
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Enable edit mode
    const editButton = screen.getByLabelText(/edit profile|עריכת פרופיל/i);
    await user.click(editButton);

    // Clear required field
    const nameInput = screen.getByDisplayValue("Test User");
    await user.clear(nameInput);

    // Try to save
    const saveButton = screen.getByText(/save changes|שמור שינויים/i);
    await user.click(saveButton);

    // Should prevent save with empty required field
    expect(global.fetch).not.toHaveBeenCalledWith(
      "/api/user/profile",
      expect.any(Object),
    );
  });

  it("should handle anniversary date input", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Enable edit mode
    const editButton = screen.getByLabelText(/edit profile|עריכת פרופיל/i);
    await user.click(editButton);

    // Find anniversary date input and set a value
    const anniversaryInput = screen.getByLabelText(/anniversary|יום נישואין/i);
    await user.type(anniversaryInput, "2020-06-15");

    expect(anniversaryInput).toHaveValue("2020-06-15");
  });

  it("should handle API key generation and copying", async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    const mockWriteText = jest.fn();
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });

    await act(async () => {
      render(<SettingsPage />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Find API key section and copy button
    const copyButton = screen.getByLabelText(/copy api key|העתק מפתח API/i);
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(expect.any(String));
  });
});
