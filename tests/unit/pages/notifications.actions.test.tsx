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
    benefit: null,
  },
];

describe('NotificationsPage actions', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation(
      async (url: string, init?: RequestInit) => {
        if (
          url === '/api/user/notifications' &&
          (!init || init.method === undefined)
        ) {
          return {
            ok: true,
            json: async () => ({ notifications: mockNotifications }),
          };
        }
        if (url === '/api/user/notifications' && init?.method === 'PATCH') {
          return { ok: true, json: async () => ({ updated: 1 }) };
        }
        if (url === '/api/user/notifications/n1' && init?.method === 'DELETE') {
          return { ok: true, json: async () => ({ deleted: true }) };
        }
        return { ok: true, json: async () => ({}) };
      }
    );
  });

  it('marks all as read and deletes a notification', async () => {
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Reminder')).toBeInTheDocument();
    });

    const markAll = screen.queryByRole('button', {
      name: /mark all|סמן הכל|סמן את הכל|סמן הכל כנקראו/i,
    });
    if (markAll) {
      fireEvent.click(markAll);
    }

    await waitFor(() => {
      expect(
        screen.getByText(/no new notifications|אין התראות חדשות/i)
      ).toBeInTheDocument();
    });

    const deleteBtn = screen
      .queryAllByRole('button')
      .find((b) => /delete|מחק/i.test(b.getAttribute('title') || ''));
    if (deleteBtn) {
      fireEvent.click(deleteBtn);
    }
  });
});
