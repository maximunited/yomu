/**
 * Fail-closed guards for Playwright Prisma seeding.
 * Prevents accidental writes against production / shared databases.
 */

/** Hosts treated as local / docker-compose without E2E_ALLOW_REMOTE_DB. */
export const E2E_LOCAL_DB_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  'db',
  'postgres',
  'postgresql',
]);

export type E2EDbGuardEnv = {
  E2E_ALLOW_DB_SEED?: string;
  E2E_ALLOW_REMOTE_DB?: string;
  DATABASE_URL?: string;
};

export function isE2EDbSeedAllowed(env: E2EDbGuardEnv = process.env): boolean {
  return env.E2E_ALLOW_DB_SEED === '1';
}

export function isE2ERemoteDbAllowed(
  env: E2EDbGuardEnv = process.env
): boolean {
  return env.E2E_ALLOW_REMOTE_DB === '1';
}

/**
 * Parse hostname from a Postgres connection string.
 * Avoids `new URL()` so Jest's WHATWG URL mock (no userinfo) cannot
 * mis-read `user:pass@host` as hostname.
 * Returns null if the authority cannot be parsed.
 */
export function getDatabaseHostname(connectionString: string): string | null {
  const trimmed = connectionString.trim();
  if (!trimmed) return null;

  const stripBrackets = (host: string) =>
    host.replace(/^\[|\]$/g, '').toLowerCase();

  // Prefer authority after '@' (handles user:password@host:port)
  const atMatch = trimmed.match(
    /@(\[[0-9a-fA-F:]+\]|[^:/?#\[\]]+)(?::\d+)?(?:[/?#]|$)/
  );
  if (atMatch) {
    return stripBrackets(atMatch[1]);
  }

  // scheme://host:port/... (no userinfo)
  const hostMatch = trimmed.match(
    /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/(\[[0-9a-fA-F:]+\]|[^:/?#\[\]]+)/
  );
  if (hostMatch) {
    return stripBrackets(hostMatch[1]);
  }

  return null;
}

export function isAllowedE2EDatabaseHost(
  connectionString: string,
  allowRemote = false
): boolean {
  const host = getDatabaseHostname(connectionString);
  if (!host) return false;
  if (E2E_LOCAL_DB_HOSTS.has(host)) return true;
  return allowRemote;
}

/**
 * Throw unless explicit seed opt-in is set and DATABASE_URL is local
 * (or remote is explicitly allowed for a disposable DB).
 */
export function assertE2EDbWriteAllowed(
  env: E2EDbGuardEnv = process.env
): void {
  if (!isE2EDbSeedAllowed(env)) {
    throw new Error(
      'E2E DB seed refused: set E2E_ALLOW_DB_SEED=1 to enable Prisma writes ' +
        '(user DOB + golden-path brands). Use a disposable/local database only.'
    );
  }

  const connectionString = env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is required for authenticated e2e Prisma seeding'
    );
  }

  const allowRemote = isE2ERemoteDbAllowed(env);
  if (!isAllowedE2EDatabaseHost(connectionString, allowRemote)) {
    const host = getDatabaseHostname(connectionString) ?? '(unparseable)';
    throw new Error(
      `E2E DB seed refused: DATABASE_URL host "${host}" is not local ` +
        `(allowed: localhost, 127.0.0.1, ::1, db, postgres, postgresql). ` +
        `Point at a local/docker DB, or set E2E_ALLOW_REMOTE_DB=1 only for a ` +
        `disposable remote database (never production).`
    );
  }
}
