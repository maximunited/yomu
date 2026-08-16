import { test, expect } from '@playwright/test';

const cronSecret = process.env.CRON_SECRET;

test.describe('Reminders cron API', () => {
  test.skip(!cronSecret, 'CRON_SECRET required for cron e2e');

  test('POST rejects missing Bearer', async ({ request }) => {
    const res = await request.post('/api/cron/reminders');
    expect([401, 503]).toContain(res.status());
  });

  test('POST accepts valid CRON_SECRET Bearer', async ({ request }) => {
    const res = await request.post('/api/cron/reminders', {
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      ok: expect.any(Boolean),
      scannedMemberships: expect.any(Number),
      candidates: expect.any(Number),
      created: expect.any(Number),
    });
  });

  test('GET requires Bearer (no cookie fallback)', async ({ request }) => {
    const res = await request.get('/api/cron/reminders');
    expect(res.status()).toBe(401);
  });
});
