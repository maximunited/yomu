/**
 * Notification channel helpers (email / push / SMS).
 */
import {
  isEmailChannelConfigured,
  isPushChannelConfigured,
  isSmsChannelConfigured,
  maybeSendReminderEmail,
  maybeSendReminderSms,
} from '@/lib/notification-channels';

describe('notification-channels', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('detects configured channels from env', () => {
    delete process.env.RESEND_API_KEY;
    expect(isEmailChannelConfigured()).toBe(false);
    process.env.RESEND_API_KEY = 'k';
    process.env.RESEND_FROM_EMAIL = 'from@test.com';
    expect(isEmailChannelConfigured()).toBe(true);

    delete process.env.VAPID_PUBLIC_KEY;
    expect(isPushChannelConfigured()).toBe(false);
    process.env.VAPID_PUBLIC_KEY = 'pub';
    process.env.VAPID_PRIVATE_KEY = 'priv';
    process.env.VAPID_SUBJECT = 'mailto:a@b.com';
    expect(isPushChannelConfigured()).toBe(true);

    delete process.env.TWILIO_ACCOUNT_SID;
    expect(isSmsChannelConfigured()).toBe(false);
    process.env.TWILIO_ACCOUNT_SID = 'AC';
    process.env.TWILIO_AUTH_TOKEN = 'tok';
    process.env.TWILIO_FROM_NUMBER = '+1555';
    expect(isSmsChannelConfigured()).toBe(true);
  });

  it('maybeSendReminderEmail skips when notifyEmail is false', async () => {
    process.env.RESEND_API_KEY = 'k';
    process.env.RESEND_FROM_EMAIL = 'from@test.com';
    const fetchMock = jest.fn();
    const sent = await maybeSendReminderEmail(
      { email: 'a@b.com', notifyEmail: false },
      { title: 'T', message: 'M' },
      fetchMock
    );
    expect(sent).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maybeSendReminderSms posts to Twilio when enabled', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'AC123';
    process.env.TWILIO_AUTH_TOKEN = 'secret';
    process.env.TWILIO_FROM_NUMBER = '+15550001';
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    const sent = await maybeSendReminderSms(
      { notifySms: true, phoneNumber: '+972501234567' },
      { title: 'Hi', message: 'Body' },
      fetchMock
    );
    expect(sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('AC123/Messages.json'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
