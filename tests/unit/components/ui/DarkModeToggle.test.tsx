import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("DarkModeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders with correct initial state", () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
    });

    it("renders with text when showText is true", () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle showText />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Dark Mode");
    });

    it("renders with custom variant and size", () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle variant="ghost" size="lg" />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("border-2", "border-gray-400");
    });

    it("applies custom className", () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle className="custom-class" />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label for light mode", () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
    });

    it("updates aria-label after toggle", async () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute("aria-label", "Switch to light mode");
      });
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard(" ");

      await waitFor(() => {
        expect(button).toHaveAttribute("aria-label", "Switch to light mode");
      });
    });

    it("has proper focus indicators", () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      button.focus();

      expect(button).toHaveFocus();
      expect(button).toHaveClass(
        "focus-visible:outline-none",
        "focus-visible:ring-2",
      );
    });
  });

  describe("Functionality", () => {
    it("toggles dark mode on click", async () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute("aria-label", "Switch to light mode");
        expect(localStorage.getItem("darkMode")).toBe("true");
      });
    });

    it("shows correct icon for light mode", () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      // Moon icon should be visible in light mode
      const moonIcon = document.querySelector(".lucide-moon");
      expect(moonIcon).toBeInTheDocument();
    });

    it("shows correct icon for dark mode", async () => {
      localStorage.setItem("darkMode", "true");

      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      await waitFor(() => {
        // Sun icon should be visible in dark mode
        const sunIcon = document.querySelector(".lucide-sun");
        expect(sunIcon).toBeInTheDocument();
      });
    });

    it("updates text content when showText is enabled", async () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle showText />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Dark Mode");

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent("Light Mode");
      });
    });
  });

  describe("Color Contrast", () => {
    it("has proper icon colors in light mode", () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      const moonIcon = document.querySelector(".lucide-moon");
      expect(moonIcon).toHaveClass("text-gray-600", "dark:text-gray-300");
    });

    it("has proper icon colors in dark mode", async () => {
      localStorage.setItem("darkMode", "true");

      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      await waitFor(() => {
        const sunIcon = document.querySelector(".lucide-sun");
        expect(sunIcon).toHaveClass("text-yellow-500");
      });
    });

    it("has proper border contrast", () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "border-2",
        "border-gray-400",
        "hover:border-gray-500",
      );
    });
  });

  describe("State Persistence", () => {
    it("applies dark mode class to document element", async () => {
      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });
    });

    it("removes dark mode class when toggled off", async () => {
      localStorage.setItem("darkMode", "true");

      render(
        <DarkModeProvider>
          <DarkModeToggle />
        </DarkModeProvider>,
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(false);
      });
    });
  });
});
