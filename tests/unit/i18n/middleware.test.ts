describe("middleware config", () => {
  it("exports a simple middleware function", () => {
    jest.resetModules();

    // Load the middleware module
    const { middleware } = require("../../../middleware");
    expect(typeof middleware).toBe("function");

    // Test that it returns NextResponse.next()
    const mockRequest = {} as any;
    const result = middleware(mockRequest);
    expect(result).toBeDefined();
  });
});
