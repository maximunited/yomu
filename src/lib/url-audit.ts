/**
 * Shared loyalty URL checker used by CLI audit + admin API.
 * HEAD with GET fallback; classifies bot-blocks vs hard failures.
 */

import http from 'http';
import https from 'https';

export const URL_AUDIT_USER_AGENT =
  'YomU-LoyaltyUrlAudit/1.0 (+https://github.com/MaximUnited/yomu)';

export const URL_AUDIT_TIMEOUT_MS = 12000;

export type UrlCheckResult = {
  url: string;
  ok: boolean;
  blocked: boolean;
  status: number | null;
  error: string | null;
  method?: string;
};

export type UrlAuditJob = {
  kind: 'brand' | 'benefit';
  id?: string;
  label: string;
  url: string;
  lastChecked?: string | Date | null;
};

function classifyStatus(
  url: string,
  status: number,
  method?: string
): UrlCheckResult {
  const blocked = status === 429 || status === 403;
  const ok = status >= 200 && status < 400;
  return {
    url,
    ok,
    blocked,
    status,
    error: null,
    ...(method ? { method } : {}),
  };
}

function getFallback(url: string): Promise<UrlCheckResult> {
  return new Promise((resolve) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      resolve({ url, ok: false, blocked: false, status: null, error: 'invalid URL' });
      return;
    }
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      url,
      {
        method: 'GET',
        timeout: URL_AUDIT_TIMEOUT_MS,
        headers: { 'User-Agent': URL_AUDIT_USER_AGENT, Accept: '*/*' },
      },
      (res) => {
        const status = res.statusCode || 0;
        res.resume();
        resolve(classifyStatus(url, status, 'GET'));
      }
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        ok: false,
        blocked: false,
        status: null,
        error: 'timeout',
        method: 'GET',
      });
    });
    req.on('error', (err) => {
      resolve({
        url,
        ok: false,
        blocked: false,
        status: null,
        error: err.message,
        method: 'GET',
      });
    });
    req.end();
  });
}

export function checkUrl(url: string): Promise<UrlCheckResult> {
  return new Promise((resolve) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      resolve({ url, ok: false, blocked: false, status: null, error: 'invalid URL' });
      return;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      resolve({
        url,
        ok: false,
        blocked: false,
        status: null,
        error: 'unsupported protocol',
      });
      return;
    }

    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      url,
      {
        method: 'HEAD',
        timeout: URL_AUDIT_TIMEOUT_MS,
        headers: { 'User-Agent': URL_AUDIT_USER_AGENT, Accept: '*/*' },
      },
      (res) => {
        if ([403, 405, 501].includes(res.statusCode || 0)) {
          res.resume();
          getFallback(url).then(resolve);
          return;
        }
        const status = res.statusCode || 0;
        res.resume();
        resolve(classifyStatus(url, status));
      }
    );
    if (!req || typeof req.on !== 'function') {
      resolve({
        url,
        ok: false,
        blocked: false,
        status: null,
        error: 'request unavailable',
      });
      return;
    }
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        ok: false,
        blocked: false,
        status: null,
        error: 'timeout',
      });
    });
    req.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ECONNRESET' || err.code === 'EPROTO') {
        getFallback(url).then(resolve);
        return;
      }
      resolve({
        url,
        ok: false,
        blocked: false,
        status: null,
        error: err.message,
      });
    });
    req.end();
  });
}

/**
 * Cap audit jobs under a limit without starving benefits behind brands.
 * Round-robins brand ↔ benefit (then any other kinds), deduping by URL.
 */
export function capUrlAuditJobs(
  jobs: UrlAuditJob[],
  limit: number
): UrlAuditJob[] {
  if (limit <= 0) return [];

  const brandQ: UrlAuditJob[] = [];
  const benefitQ: UrlAuditJob[] = [];
  const otherQ: UrlAuditJob[] = [];
  for (const job of jobs) {
    if (!job.url) continue;
    if (job.kind === 'brand') brandQ.push(job);
    else if (job.kind === 'benefit') benefitQ.push(job);
    else otherQ.push(job);
  }

  const queues = [brandQ, benefitQ, otherQ].filter((q) => q.length > 0);
  const indices = queues.map(() => 0);
  const out: UrlAuditJob[] = [];
  const seen = new Set<string>();

  while (out.length < limit) {
    let progressed = false;
    for (let q = 0; q < queues.length && out.length < limit; q++) {
      while (indices[q] < queues[q].length) {
        const job = queues[q][indices[q]++];
        if (seen.has(job.url)) continue;
        seen.add(job.url);
        out.push(job);
        progressed = true;
        break;
      }
    }
    if (!progressed) break;
  }

  return out;
}

export async function runUrlAudit(
  jobs: UrlAuditJob[],
  options?: { concurrency?: number; staleDays?: number }
): Promise<{
  checkedAt: string;
  results: Array<UrlAuditJob & UrlCheckResult>;
  summary: {
    total: number;
    ok: number;
    failures: number;
    blocked: number;
    stale: number;
    unchecked: number;
  };
}> {
  const concurrency = options?.concurrency ?? 6;
  const staleDays = options?.staleDays ?? 60;

  const seen = new Map<string, UrlAuditJob>();
  for (const job of jobs) {
    if (job.url && !seen.has(job.url)) seen.set(job.url, job);
  }
  const unique = [...seen.values()];

  const results: Array<UrlAuditJob & UrlCheckResult> = new Array(unique.length);
  let i = 0;

  async function worker() {
    while (i < unique.length) {
      const idx = i++;
      const job = unique[idx];
      const check = await checkUrl(job.url);
      results[idx] = { ...job, ...check };
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, Math.max(unique.length, 1)) }, () =>
      worker()
    )
  );

  const now = Date.now();
  const daysSince = (iso: string | Date | null | undefined) => {
    if (!iso) return null;
    const t = Date.parse(String(iso).slice(0, 10));
    if (Number.isNaN(t)) return null;
    return Math.floor((now - t) / (24 * 60 * 60 * 1000));
  };

  const blocked = results.filter((r) => r.blocked);
  const failures = results.filter((r) => !r.ok && !r.blocked);
  const stale = results.filter((r) => {
    const d = daysSince(r.lastChecked);
    return d !== null && d > staleDays;
  });
  const unchecked = results.filter((r) => !r.lastChecked);
  const ok = results.filter((r) => r.ok);

  return {
    checkedAt: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      ok: ok.length,
      failures: failures.length,
      blocked: blocked.length,
      stale: stale.length,
      unchecked: unchecked.length,
    },
  };
}
