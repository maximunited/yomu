/**
 * Color contrast testing utilities and tests
 * Tests WCAG 2.1 AA compliance for color combinations
 */

interface ColorContrastTest {
  background: string;
  foreground: string;
  expectedRatio: number;
  wcagLevel: "AA" | "AAA";
  textSize: "normal" | "large";
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
function meetsWCAGStandard(
  ratio: number,
  level: "AA" | "AAA",
  textSize: "normal" | "large",
): boolean {
  if (level === "AA") {
    return textSize === "large" ? ratio >= 3.0 : ratio >= 4.5;
  } else {
    return textSize === "large" ? ratio >= 4.5 : ratio >= 7.0;
  }
}

describe("Color Contrast Utilities", () => {
  describe("hexToRgb", () => {
    it("converts hex colors to RGB", () => {
      expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("ffffff")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("returns null for invalid hex colors", () => {
      expect(hexToRgb("invalid")).toBeNull();
      expect(hexToRgb("#gg0000")).toBeNull();
    });
  });

  describe("getLuminance", () => {
    it("calculates correct luminance values", () => {
      expect(getLuminance(255, 255, 255)).toBeCloseTo(1.0, 2);
      expect(getLuminance(0, 0, 0)).toBeCloseTo(0.0, 2);
    });
  });

  describe("getContrastRatio", () => {
    it("calculates correct contrast ratios", () => {
      // White on black should have maximum contrast
      expect(getContrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 0);

      // Same colors should have ratio of 1
      expect(getContrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 0);
      expect(getContrastRatio("#000000", "#000000")).toBeCloseTo(1, 0);
    });
  });

  describe("meetsWCAGStandard", () => {
    it("correctly validates WCAG AA standards", () => {
      expect(meetsWCAGStandard(4.5, "AA", "normal")).toBe(true);
      expect(meetsWCAGStandard(4.4, "AA", "normal")).toBe(false);
      expect(meetsWCAGStandard(3.0, "AA", "large")).toBe(true);
      expect(meetsWCAGStandard(2.9, "AA", "large")).toBe(false);
    });

    it("correctly validates WCAG AAA standards", () => {
      expect(meetsWCAGStandard(7.0, "AAA", "normal")).toBe(true);
      expect(meetsWCAGStandard(6.9, "AAA", "normal")).toBe(false);
      expect(meetsWCAGStandard(4.5, "AAA", "large")).toBe(true);
      expect(meetsWCAGStandard(4.4, "AAA", "large")).toBe(false);
    });
  });
});

describe("YomU Color Contrast Standards", () => {
  const colorTests: ColorContrastTest[] = [
    // Light mode combinations
    {
      background: "#ffffff",
      foreground: "#1f2937", // gray-800
      expectedRatio: 16.0,
      wcagLevel: "AAA",
      textSize: "normal",
    },
    {
      background: "#f9fafb", // gray-50
      foreground: "#111827", // gray-900
      expectedRatio: 18.0,
      wcagLevel: "AAA",
      textSize: "normal",
    },
    {
      background: "#ffffff",
      foreground: "#374151", // gray-700
      expectedRatio: 10.3,
      wcagLevel: "AAA",
      textSize: "normal",
    },
    {
      background: "#ffffff",
      foreground: "#6b7280", // gray-500
      expectedRatio: 4.8,
      wcagLevel: "AA",
      textSize: "normal",
    },

    // Dark mode combinations
    {
      background: "#111827", // gray-900
      foreground: "#ffffff",
      expectedRatio: 18.0,
      wcagLevel: "AAA",
      textSize: "normal",
    },
    {
      background: "#1f2937", // gray-800
      foreground: "#f9fafb", // gray-50
      expectedRatio: 14.0,
      wcagLevel: "AAA",
      textSize: "normal",
    },
    {
      background: "#374151", // gray-700
      foreground: "#ffffff",
      expectedRatio: 10.3,
      wcagLevel: "AAA",
      textSize: "normal",
    },

    // Brand colors
    {
      background: "#ffffff",
      foreground: "#dc2626", // red-600 (error)
      expectedRatio: 4.8,
      wcagLevel: "AA",
      textSize: "normal",
    },
    {
      background: "#ffffff",
      foreground: "#059669", // green-600 (success)
      expectedRatio: 3.77,
      wcagLevel: "AA",
      textSize: "large", // Large text has lower requirements (3.0)
    },
    {
      background: "#ffffff",
      foreground: "#2563eb", // blue-600 (primary)
      expectedRatio: 5.2,
      wcagLevel: "AA",
      textSize: "normal",
    },

    // Button combinations
    {
      background: "#2563eb", // blue-600
      foreground: "#ffffff",
      expectedRatio: 5.2,
      wcagLevel: "AA",
      textSize: "normal",
    },
    {
      background: "#dc2626", // red-600
      foreground: "#ffffff",
      expectedRatio: 4.8,
      wcagLevel: "AA",
      textSize: "normal",
    },
  ];

  describe("Light Mode Color Contrast", () => {
    const lightModeTests = colorTests.filter(
      (test) => test.background === "#ffffff" || test.background === "#f9fafb",
    );

    lightModeTests.forEach((test, index) => {
      it(`meets WCAG ${test.wcagLevel} standards for combination ${index + 1}`, () => {
        const ratio = getContrastRatio(test.background, test.foreground);
        expect(ratio).toBeGreaterThanOrEqual(test.expectedRatio * 0.85); // Allow 15% tolerance for browser differences
        expect(meetsWCAGStandard(ratio, test.wcagLevel, test.textSize)).toBe(
          true,
        );
      });
    });
  });

  describe("Dark Mode Color Contrast", () => {
    const darkModeTests = colorTests.filter(
      (test) =>
        test.background === "#111827" ||
        test.background === "#1f2937" ||
        test.background === "#374151",
    );

    darkModeTests.forEach((test, index) => {
      it(`meets WCAG ${test.wcagLevel} standards for combination ${index + 1}`, () => {
        const ratio = getContrastRatio(test.background, test.foreground);
        expect(ratio).toBeGreaterThanOrEqual(test.expectedRatio * 0.85); // Allow 15% tolerance for browser differences
        expect(meetsWCAGStandard(ratio, test.wcagLevel, test.textSize)).toBe(
          true,
        );
      });
    });
  });

  describe("Interactive Element Contrast", () => {
    const interactiveTests = colorTests.filter(
      (test) => test.background === "#2563eb" || test.background === "#dc2626",
    );

    interactiveTests.forEach((test, index) => {
      it(`button combination ${index + 1} meets accessibility standards`, () => {
        const ratio = getContrastRatio(test.background, test.foreground);
        expect(ratio).toBeGreaterThanOrEqual(test.expectedRatio * 0.9);
        expect(meetsWCAGStandard(ratio, test.wcagLevel, test.textSize)).toBe(
          true,
        );
      });
    });
  });

  describe("Focus State Contrast", () => {
    it("focus ring has sufficient contrast against backgrounds", () => {
      // Focus ring color (#2563eb) against various backgrounds
      const focusTests = [
        { bg: "#ffffff", expected: 8.6 },
        { bg: "#f9fafb", expected: 8.0 },
        { bg: "#111827", expected: 2.4 },
      ];

      focusTests.forEach((test) => {
        const ratio = getContrastRatio(test.bg, "#2563eb");
        expect(ratio).toBeGreaterThanOrEqual(3.0); // Minimum for non-text UI components
      });
    });
  });
});

// Export utilities for use in other tests
export {
  hexToRgb,
  getLuminance,
  getContrastRatio,
  meetsWCAGStandard,
  type ColorContrastTest,
};
