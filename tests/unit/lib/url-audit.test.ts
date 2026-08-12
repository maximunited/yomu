import { runUrlAudit } from '@/lib/url-audit';

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
