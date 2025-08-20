import { getMessages, DEFAULT_LOCALE } from "@/i18n/messages";

describe("i18n messages", () => {
  it("returns messages for default locale", () => {
    const msgs = getMessages(DEFAULT_LOCALE);
    expect(typeof msgs).toBe("object");
    expect(Object.keys(msgs).length).toBeGreaterThan(10);
  });
});
