import { getMessages } from "@/i18n/messages";

describe("getMessages default locale", () => {
  it("returns object with many keys", async () => {
    const msgs = await getMessages("he");
    expect(typeof msgs).toBe("object");
    expect(Object.keys(msgs).length).toBeGreaterThan(50);
  });
});
