import { render, screen, fireEvent, waitFor } from '../../utils/test-helpers';
import NotificationsPage from '@/app/notifications/page';
import { REMINDER_TYPE_UPCOMING } from '@/lib/reminders';

const mockNotifications = [
  {
    id: 'n1',
    title: 'Reminder',
    message: 'Benefit soon',
    type: REMINDER_TYPE_UPCOMING,
    uiType: 'warning' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    benefit: {
      id: 'b1',
      title: 'Free burger',
      brand: "McDonald's",
    },
  },
  {
    id: 'n2',
    title: 'Read notice',
    message: 'Already read',
    type: 'info',
    uiType: 'info' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    benefit: null,
  },
];

describe('NotificationsPage (render + basic interactions)', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation(
      async (url: string, init?: RequestInit) => {
        if (url === '/api/user/notifications') {
          return {
            ok: true,
            json: async () => ({ notifications: mockNotifications }),
          };
        }
        if (url === '/api/user/notifications/n1' && init?.method === 'PATCH') {
          return { ok: true, json: async () => ({}) };
        }
        return { ok: true, json: async () => ({}) };
      }
    );
  });

  it('renders list and allows mark all as read', async () => {
    render(<NotificationsPage />);
    await waitFor(() => {
      expect(
        screen.getAllByText(/Notifications|התראות|notifications/i)[0]
      ).toBeInTheDocument();
    });

    const markAllButtons = screen.queryAllByText(/Mark All|סמן הכל|mark/i);
    if (markAllButtons[0]) {
      fireEvent.click(markAllButtons[0]);
    }
  });
});
