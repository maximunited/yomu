import React from "react";

// Force English as default for tests before importing helpers/pages
jest.mock("@/i18n/messages", () => {
  const actual = jest.requireActual("@/i18n/messages");
  return { ...actual, DEFAULT_LOCALE: "en" as const };
});
jest.mock("@/lib/languages", () => {
  const actual = jest.requireActual("@/lib/languages");
  return { ...actual, DEFAULT_LANGUAGE: "en" as const };
});

import { render, screen } from "../../utils/test-helpers";
import DashboardPage from "@/app/dashboard/page";

// Hebrew validity phrases that should not appear when UI is English
const HEB_VALID_ENTIRE_MONTH = /תקף לכל החודש/;
const HEB_VALID_ONLY_BDAY = /תקף ביום ההולדת בלבד/;

describe("English UI should not include Hebrew validity labels", () => {
  it("Dashboard does not show Hebrew validity text in English UI", () => {
    const { container } = render(<DashboardPage />);
    expect(screen.queryByText(HEB_VALID_ENTIRE_MONTH)).toBeNull();
    expect(screen.queryByText(HEB_VALID_ONLY_BDAY)).toBeNull();
  });
});
