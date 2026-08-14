import { REMINDER_TYPE_ACTIVE, REMINDER_TYPE_UPCOMING } from '@/lib/reminders';

export type NotificationUiType = 'info' | 'warning' | 'success';

export function mapNotificationUiType(type: string): NotificationUiType {
  if (type === REMINDER_TYPE_ACTIVE) return 'success';
  if (type === REMINDER_TYPE_UPCOMING) return 'warning';
  return 'info';
}

export type SerializedNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  uiType: NotificationUiType;
  isRead: boolean;
  createdAt: string;
  benefit: {
    id: string;
    title: string;
    brand: string;
  } | null;
};

type NotificationWithBenefit = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
  benefit: {
    id: string;
    title: string;
    brand: { name: string };
  } | null;
};

export function serializeNotification(
  row: NotificationWithBenefit
): SerializedNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    uiType: mapNotificationUiType(row.type),
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
    benefit: row.benefit
      ? {
          id: row.benefit.id,
          title: row.benefit.title,
          brand: row.benefit.brand.name,
        }
      : null,
  };
}

export const notificationInclude = {
  benefit: {
    select: {
      id: true,
      title: true,
      brand: { select: { name: true } },
    },
  },
} as const;
