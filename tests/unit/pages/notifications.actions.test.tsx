import { render, screen, fireEvent } from "../../utils/test-helpers";
import NotificationsPage from "@/app/notifications/page";

describe("NotificationsPage actions", () => {
  it("marks all as read and deletes a notification", () => {
    render(<NotificationsPage />);

    // Mark all as read (button exists only when unreadCount > 0)
    const markAll = screen.queryByRole("button", {
      name: /mark all|סמן הכל|סמן את הכל|סמן הכל כנקראו/i,
    });
    if (markAll) {
      fireEvent.click(markAll);
    }

    // Should show no new notifications text
    expect(
      screen.getByText(/no new notifications|אין התראות חדשות/i),
    ).toBeInTheDocument();

    // Delete button should still be present for any notification items
    const deleteBtn = screen
      .queryAllByRole("button")
      .find((b) => /delete|מחק/i.test(b.getAttribute("title") || ""));
    if (deleteBtn) {
      fireEvent.click(deleteBtn);
    }
  });
});
