/**
 * Optional outbound reminder channels (email, Web Push, SMS).
 * Each channel no-ops when env credentials or user prefs are missing.
 */
import webpush from 'web-push';
import type { ReminderCandidate, ReminderCopy } from '@/lib/reminders';

export type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export function isEmailChannelConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export function isPushChannelConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT
  );
}

export function isSmsChannelConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  );
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY?.trim() || null;
}

function configureWebPush(): void {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return;
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function maybeSendReminderEmail(
  candidate: Pick<ReminderCandidate, 'email' | 'notifyEmail'>,
  copy: ReminderCopy,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!candidate.notifyEmail || !apiKey || !from || !candidate.email) {
    return false;
  }

  const res = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [candidate.email],
      subject: copy.title,
      text: copy.message,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body.slice(0, 200)}`);
  }
  return true;
}

export async function maybeSendReminderPush(
  candidate: Pick<ReminderCandidate, 'notifyPush'>,
  copy: ReminderCopy,
  subscriptions: PushSubscriptionRow[]
): Promise<number> {
  if (!candidate.notifyPush || !isPushChannelConfigured()) return 0;
  if (subscriptions.length === 0) return 0;

  configureWebPush();
  let sent = 0;
  const payload = JSON.stringify({
    title: copy.title,
    body: copy.message,
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      sent += 1;
    } catch (err) {
      const statusCode =
        err && typeof err === 'object' && 'statusCode' in err
          ? Number((err as { statusCode: number }).statusCode)
          : 0;
      if (statusCode === 404 || statusCode === 410) {
        continue;
      }
      throw err;
    }
  }

  return sent;
}

export async function maybeSendReminderSms(
  candidate: Pick<ReminderCandidate, 'notifySms' | 'phoneNumber'>,
  copy: ReminderCopy,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = candidate.phoneNumber?.trim();

  if (!candidate.notifySms || !accountSid || !authToken || !from || !to) {
    return false;
  }

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: `${copy.title}\n${copy.message}`,
  });

  const res = await fetchImpl(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Twilio ${res.status}: ${text.slice(0, 200)}`);
  }
  return true;
}
