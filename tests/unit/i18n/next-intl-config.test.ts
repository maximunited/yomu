jest.mock('next-intl/server', () => ({
  getRequestConfig: (factory: any) => factory,
}));

// Import after mock to avoid ESM parse
// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultConfig = require('i18n').default as any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaultLocale } = require('i18n');

describe('next-intl app router config', () => {
  it('exports default config with locale and messages', async () => {
    const cfg = await defaultConfig({ requestLocale: Promise.resolve('he') });
    expect(typeof cfg.locale).toBe('string');
    expect(cfg.locale).toBe('he');
    expect(typeof cfg.messages).toBe('object');
  });
});
