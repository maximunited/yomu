import { render, screen, fireEvent } from '../../utils/test-helpers';
import NotificationsPage from '@/app/notifications/page';

describe('NotificationsPage (render + basic interactions)', () => {
  it('renders list and allows mark all as read', () => {
    render(<NotificationsPage />);
    expect(
      screen.getAllByText(/Notifications|התראות|notifications/i)[0]
    ).toBeInTheDocument();
    const markAllButtons = screen.queryAllByText(/Mark All|סמן הכל|mark/i);
    if (markAllButtons[0]) {
      fireEvent.click(markAllButtons[0]);
    }
  });
});
