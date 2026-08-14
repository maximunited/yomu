'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Bell, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SerializedNotification } from '@/lib/notifications';

type NotificationItem = SerializedNotification & {
  timestamp: Date;
  relatedBenefits?: { id: string; brand: string; title: string }[];
};

function toNotificationItem(row: SerializedNotification): NotificationItem {
  return {
    ...row,
    timestamp: new Date(row.createdAt),
    relatedBenefits: row.benefit
      ? [
          {
            id: row.benefit.id,
            brand: row.benefit.brand,
            title: row.benefit.title,
          },
        ]
      : undefined,
  };
}

export default function NotificationsPage() {
  const { isLoaded } = useUser();
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchSeq = useRef(0);

  const loadNotifications = useCallback(async () => {
    const seq = ++fetchSeq.current;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/notifications');
      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }
      const data = (await response.json()) as {
        notifications: SerializedNotification[];
      };
      if (seq !== fetchSeq.current) return;
      setNotifications(data.notifications.map(toNotificationItem));
    } catch {
      if (seq !== fetchSeq.current) return;
      setError(t('notificationsLoadError'));
    } finally {
      if (seq === fetchSeq.current) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    if (isLoaded) {
      void loadNotifications();
    }
  }, [isLoaded, loadNotifications]);

  const markAsRead = async (id: string) => {
    fetchSeq.current += 1;
    const response = await fetch(`/api/user/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    });
    if (!response.ok) return;
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = async () => {
    fetchSeq.current += 1;
    const response = await fetch('/api/user/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
    if (!response.ok) return;
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = async (id: string) => {
    fetchSeq.current += 1;
    const response = await fetch(`/api/user/notifications/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) return;
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('notifications')}
              </h1>
              <p className="text-gray-600">
                {unreadCount > 0
                  ? t('newNotificationsCount').replace(
                      '{count}',
                      String(unreadCount)
                    )
                  : t('noNewNotifications')}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => void markAllAsRead()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>{t('markAllAsRead')}</span>
            </button>
          )}
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        )}

        {/* Notifications List */}
        <div className="max-w-2xl mx-auto">
          {error ? null : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('noNotifications')}
              </h3>
              <p className="text-gray-600">{t('noNewNotifications')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${
                    !notification.isRead ? 'border-l-4 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3
                          className={`font-semibold text-lg ${
                            !notification.isRead
                              ? 'text-gray-900'
                              : 'text-gray-600'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">
                        {notification.message}
                      </p>
                      {notification.relatedBenefits &&
                        notification.relatedBenefits.length > 0 && (
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3 text-sm text-gray-700">
                            {notification.relatedBenefits
                              .slice(0, 2)
                              .map((b) => (
                                <div key={b.id} className="truncate">
                                  • {b.brand} — {b.title}
                                </div>
                              ))}
                            {notification.relatedBenefits.length > 2 && (
                              <div className="mt-1">
                                <Link
                                  href="/dashboard?recent=1"
                                  className="text-purple-700 hover:text-purple-900 underline"
                                >
                                  {t('andMore').replace(
                                    '{count}',
                                    String(
                                      notification.relatedBenefits.length - 2
                                    )
                                  )}
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      <p className="text-sm text-gray-500">
                        {notification.timestamp.toLocaleDateString(
                          language === 'he' ? 'he-IL' : language,
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => void markAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          title={t('markAsRead')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => void deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title={t('delete')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
