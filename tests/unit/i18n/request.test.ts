jest.mock("next-intl/server", () => ({
  getRequestConfig: (factory: any) => factory,
}));

// Import after mock so ESM from next-intl isn't loaded
// eslint-disable-next-line @typescript-eslint/no-var-requires
const i18nRequestConfig = require("i18n/request").default as any;

describe("i18n request config", () => {
  it("resolves supported locale and messages", async () => {
    const cfg = await i18nRequestConfig({
      requestLocale: Promise.resolve("en"),
    });
    expect(cfg.locale).toBe("en");
    expect(cfg.messages).toBeTruthy();
  });

  it("falls back to default on unsupported locale", async () => {
    const cfg = await i18nRequestConfig({
      requestLocale: Promise.resolve("xx"),
    });
    expect(cfg.locale).toBe("he");
  });
});
