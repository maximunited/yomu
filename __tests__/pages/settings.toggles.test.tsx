import { render, screen, fireEvent } from "@testing-library/react";
import SettingsPage from "@/app/settings/page";

describe("SettingsPage toggles", () => {
  it("toggles dark mode and edits api key", () => {
    render(<SettingsPage />);

    // Dark mode toggle
    const darkToggle = screen.getByRole("button", { name: /dark|light|מצב/i });
    fireEvent.click(darkToggle);

    // API key edit flow
    const editBtn = screen.getByRole("button", { name: /edit api key|עריכת/i });
    fireEvent.click(editBtn);
    const saveBtn = screen.getByRole("button", { name: /save api key|שמירה/i });
    fireEvent.click(saveBtn);
  });
});
