import {
  assertE2EDbWriteAllowed,
  getDatabaseHostname,
  isAllowedE2EDatabaseHost,
  isE2EDbSeedAllowed,
  isE2ERemoteDbAllowed,
} from '../../../tests/e2e/helpers/e2e-db-guard';

describe('e2e DB write guards', () => {
  const localUrl = 'postgresql://yomu:yomu@localhost:5432/yomu';
  const dockerUrl = 'postgresql://yomu:yomu@db:5432/yomu';
  const remoteUrl =
    'postgres://u:p@ep-cool-pooler.us-east-1.aws.neon.tech:5432/neondb';

  it('requires E2E_ALLOW_DB_SEED=1', () => {
    expect(isE2EDbSeedAllowed({})).toBe(false);
    expect(isE2EDbSeedAllowed({ E2E_ALLOW_DB_SEED: '1' })).toBe(true);
    expect(isE2EDbSeedAllowed({ E2E_ALLOW_DB_SEED: 'true' })).toBe(false);
  });

  it('parses hostnames from postgres URLs', () => {
    expect(getDatabaseHostname(localUrl)).toBe('localhost');
    expect(getDatabaseHostname(dockerUrl)).toBe('db');
    expect(getDatabaseHostname(remoteUrl)).toBe(
      'ep-cool-pooler.us-east-1.aws.neon.tech'
    );
    expect(getDatabaseHostname('postgresql://127.0.0.1:5432/yomu')).toBe(
      '127.0.0.1'
    );
    expect(getDatabaseHostname('not-a-url')).toBeNull();
  });

  it('allowlists localhost / docker hosts and fail-closes remotes', () => {
    expect(isAllowedE2EDatabaseHost(localUrl)).toBe(true);
    expect(
      isAllowedE2EDatabaseHost('postgresql://u:p@127.0.0.1:5432/yomu')
    ).toBe(true);
    expect(isAllowedE2EDatabaseHost(dockerUrl)).toBe(true);
    expect(isAllowedE2EDatabaseHost(remoteUrl)).toBe(false);
    expect(isAllowedE2EDatabaseHost(remoteUrl, true)).toBe(true);
  });

  it('assertE2EDbWriteAllowed hard-fails without seed flag', () => {
    expect(() =>
      assertE2EDbWriteAllowed({
        DATABASE_URL: localUrl,
      })
    ).toThrow(/E2E_ALLOW_DB_SEED=1/);
  });

  it('assertE2EDbWriteAllowed hard-fails on remote host without remote flag', () => {
    expect(() =>
      assertE2EDbWriteAllowed({
        E2E_ALLOW_DB_SEED: '1',
        DATABASE_URL: remoteUrl,
      })
    ).toThrow(/E2E_ALLOW_REMOTE_DB=1/);
  });

  it('assertE2EDbWriteAllowed allows local with seed flag', () => {
    expect(() =>
      assertE2EDbWriteAllowed({
        E2E_ALLOW_DB_SEED: '1',
        DATABASE_URL: localUrl,
      })
    ).not.toThrow();
  });

  it('assertE2EDbWriteAllowed allows remote only with both flags', () => {
    expect(isE2ERemoteDbAllowed({ E2E_ALLOW_REMOTE_DB: '1' })).toBe(true);
    expect(() =>
      assertE2EDbWriteAllowed({
        E2E_ALLOW_DB_SEED: '1',
        E2E_ALLOW_REMOTE_DB: '1',
        DATABASE_URL: remoteUrl,
      })
    ).not.toThrow();
  });

  it('assertE2EDbWriteAllowed requires DATABASE_URL when seed is allowed', () => {
    expect(() =>
      assertE2EDbWriteAllowed({
        E2E_ALLOW_DB_SEED: '1',
      })
    ).toThrow(/DATABASE_URL/);
  });
});
