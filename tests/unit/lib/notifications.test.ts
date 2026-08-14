import {
  mapNotificationUiType,
  serializeNotification,
} from '@/lib/notifications';
import { REMINDER_TYPE_ACTIVE, REMINDER_TYPE_UPCOMING } from '@/lib/reminders';

describe('notifications lib', () => {
  it('maps reminder types to UI types', () => {
    expect(mapNotificationUiType(REMINDER_TYPE_ACTIVE)).toBe('success');
    expect(mapNotificationUiType(REMINDER_TYPE_UPCOMING)).toBe('warning');
    expect(mapNotificationUiType('other')).toBe('info');
  });

  it('serializes notification rows', () => {
    const createdAt = new Date('2026-08-14T10:00:00.000Z');
    const serialized = serializeNotification({
      id: 'n1',
      title: 'Title',
      message: 'Message',
      type: REMINDER_TYPE_UPCOMING,
      isRead: false,
      createdAt,
      benefit: {
        id: 'b1',
        title: 'Free burger',
        brand: { name: "McDonald's" },
      },
    });

    expect(serialized).toEqual({
      id: 'n1',
      title: 'Title',
      message: 'Message',
      type: REMINDER_TYPE_UPCOMING,
      uiType: 'warning',
      isRead: false,
      createdAt: createdAt.toISOString(),
      benefit: {
        id: 'b1',
        title: 'Free burger',
        brand: "McDonald's",
      },
    });
  });
});
