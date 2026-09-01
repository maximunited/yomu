import { defineConfig, env } from 'prisma/config';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFiles() {
  const presetKeys = new Set(Object.keys(process.env));

  function loadFile(fileName: string, canOverrideFileEnv: boolean) {
    const filePath = resolve(process.cwd(), fileName);
    if (!existsSync(filePath)) return;
    for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (presetKeys.has(key)) continue;
      if (!canOverrideFileEnv && process.env[key] !== undefined) continue;
      process.env[key] = value;
    }
  }

  loadFile('.env', false);
  loadFile('.env.local', true);
}

loadEnvFiles();

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
});
