import {
  capUrlAuditJobs,
  runUrlAudit,
  type UrlAuditJob,
} from '@/lib/url-audit';

describe('runUrlAudit', () => {
  it('rejects unsupported protocols without network I/O', async () => {
    const report = await runUrlAudit(
      [
        { kind: 'brand', label: 'ftp', url: 'ftp://example.com/x' },
        { kind: 'brand', label: 'dup', url: 'ftp://example.com/x' },
      ],
      { concurrency: 1 }
    );
    expect(report.summary.total).toBe(1);
    expect(report.summary.failures).toBe(1);
    expect(report.results[0].error).toBe('unsupported protocol');
  });
});

describe('capUrlAuditJobs', () => {
  it('interleaves brand and benefit URLs under the limit', () => {
    const jobs: UrlAuditJob[] = [
      { kind: 'brand', label: 'B1', url: 'https://b1.example' },
      { kind: 'brand', label: 'B2', url: 'https://b2.example' },
      { kind: 'brand', label: 'B3', url: 'https://b3.example' },
      { kind: 'benefit', label: 'F1', url: 'https://f1.example' },
      { kind: 'benefit', label: 'F2', url: 'https://f2.example' },
    ];
    const capped = capUrlAuditJobs(jobs, 4);
    expect(capped).toHaveLength(4);
    expect(capped.map((j) => j.kind)).toEqual([
      'brand',
      'benefit',
      'brand',
      'benefit',
    ]);
    expect(capped.filter((j) => j.kind === 'benefit')).toHaveLength(2);
  });

  it('fills remaining slots from the longer queue', () => {
    const jobs: UrlAuditJob[] = [
      { kind: 'brand', label: 'B1', url: 'https://b1.example' },
      { kind: 'benefit', label: 'F1', url: 'https://f1.example' },
      { kind: 'benefit', label: 'F2', url: 'https://f2.example' },
      { kind: 'benefit', label: 'F3', url: 'https://f3.example' },
    ];
    const capped = capUrlAuditJobs(jobs, 4);
    expect(capped.map((j) => j.kind)).toEqual([
      'brand',
      'benefit',
      'benefit',
      'benefit',
    ]);
  });
});
