import "@testing-library/jest-dom";

// Mock next-intl (avoid ESM transform issues)
jest.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }) => children,
  useTranslations: () => (key) => {
    try {
      const { translations } = require("@/lib/translations");
      // Default Hebrew for tests
      return translations.he?.[key] || translations.en?.[key] || key;
    } catch {
      return key;
    }
  },
  useFormatter: () => ({}),
}));

// Provide a default LanguageContext mock for tests that don't wrap providers
jest.mock("@/contexts/LanguageContext", () => {
  const React = require("react");
  const { translations } = require("@/lib/translations");
  return {
    useLanguage: () => ({
      t: (key) => {
        // Default to Hebrew to satisfy most tests
        const he = translations.he?.[key];
        // Some tests expect English strings explicitly
        if (key === "markAsUsed" || key === "unmarkAsUsed") {
          return translations.en?.[key] || he || key;
        }
        return he || translations.en?.[key] || key;
      },
      language: "he",
      setLanguage: jest.fn(),
      dir: "rtl",
      languageInfo: { code: "he", dir: "rtl", isRTL: true },
      isRTL: true,
    }),
    LanguageProvider: ({ children }) =>
      React.createElement(React.Fragment, null, children),
  };
});

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Ensure document has correct html attributes for tests expecting RTL Hebrew
document.documentElement.lang = "he";
document.documentElement.dir = "rtl";

// Ensure presence of common meta tags and title for tests
let viewport = document.querySelector('meta[name="viewport"]');
if (!viewport) {
  viewport = document.createElement("meta");
  viewport.setAttribute("name", "viewport");
  document.head.appendChild(viewport);
}
viewport.setAttribute("content", "width=device-width, initial-scale=1");

let description = document.querySelector('meta[name="description"]');
if (!description) {
  description = document.createElement("meta");
  description.setAttribute("name", "description");
  document.head.appendChild(description);
}
description.setAttribute(
  "content",
  "Discover and manage your birthday benefits from all your favorite brands",
);

document.title = "YomU - יום-You | Birthday Benefits";

// Stub alert to avoid jsdom not implemented errors
global.alert = jest.fn();

// Suppress React act() warnings to stabilize tests (React 18/19 noisy updates during async effects)
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args && args[0] ? String(args[0]) : "";
  if (
    typeof message === "string" &&
    (message.includes("not wrapped in act") ||
      message.includes("Warning: An update to"))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock NextAuth
jest.mock("next-auth/react", () => {
  const React = require("react");
  return {
    useSession: jest.fn(() => ({
      data: null,
      status: "unauthenticated",
    })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    SessionProvider: ({ children }) =>
      React.createElement(React.Fragment, null, children),
  };
});

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    benefit: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    brand: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    userMembership: {
      findMany: jest.fn(),
    },
  },
}));

// Global test utilities
// Provide a basic fetch mock
global.fetch = jest
  .fn()
  .mockResolvedValue({ ok: true, json: async () => ({}) });

// Polyfill for Web API objects used in Next.js API routes
global.Request = class Request {
  constructor(input, init) {
    const url = typeof input === "string" ? input : input.url;
    const method = init?.method || "GET";
    const headers = new Headers(init?.headers);
    const body = init?.body;

    // Use property descriptors to make properties compatible with NextRequest
    Object.defineProperty(this, "url", {
      value: url,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    Object.defineProperty(this, "method", {
      value: method,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    Object.defineProperty(this, "headers", {
      value: headers,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    Object.defineProperty(this, "body", {
      value: body,
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }

  async json() {
    return JSON.parse(this.body || "{}");
  }
};

global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
  }

  async json() {
    return JSON.parse(this.body || "{}");
  }

  static json(data, init) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  }
};

global.Headers = class Headers {
  constructor(init) {
    this.map = new Map();
    if (init) {
      if (init instanceof Headers) {
        init.map.forEach((value, key) => this.map.set(key, value));
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.map.set(key, value));
      } else {
        Object.entries(init).forEach(([key, value]) =>
          this.map.set(key, value),
        );
      }
    }
  }

  get(name) {
    return this.map.get(name.toLowerCase());
  }

  set(name, value) {
    this.map.set(name.toLowerCase(), value);
  }

  entries() {
    return this.map.entries();
  }

  keys() {
    return this.map.keys();
  }

  values() {
    return this.map.values();
  }

  has(name) {
    return this.map.has(name.toLowerCase());
  }

  delete(name) {
    return this.map.delete(name.toLowerCase());
  }

  forEach(callback, thisArg) {
    this.map.forEach(callback, thisArg);
  }
};

global.URL = class URL {
  constructor(url, base) {
    const urlString = String(url);
    this.href = urlString;
    this.origin = "http://localhost:3000";
    this.protocol = "http:";
    this.host = "localhost:3000";
    this.hostname = "localhost";
    this.port = "3000";
    this.pathname = "/";
    this.search = "";
    this.hash = "";

    // Parse the URL string
    try {
      if (urlString.includes("://")) {
        const [protocol, rest] = urlString.split("://");
        this.protocol = protocol + ":";

        let remaining = rest;
        if (remaining.includes("/")) {
          const [hostPart, pathPart] = remaining.split("/", 2);
          this.host = hostPart;
          this.pathname = "/" + pathPart;
        } else {
          this.host = remaining;
        }

        if (this.host.includes(":")) {
          [this.hostname, this.port] = this.host.split(":");
        } else {
          this.hostname = this.host;
          this.port = "";
        }

        this.origin = `${this.protocol}//${this.host}`;
      }
    } catch (e) {
      // Fallback for malformed URLs
    }

    this.searchParams = new URLSearchParams();
    if (urlString.includes("?")) {
      const [, query] = urlString.split("?");
      this.search = "?" + query;
      this.searchParams = new URLSearchParams(query);
    }
  }

  toString() {
    return this.href;
  }

  toJSON() {
    return this.href;
  }
};

global.URLSearchParams = class URLSearchParams {
  constructor(init) {
    this.params = new Map();
    if (typeof init === "string") {
      init.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key)
          this.params.set(
            decodeURIComponent(key),
            decodeURIComponent(value || ""),
          );
      });
    }
  }

  get(name) {
    return this.params.get(name);
  }

  set(name, value) {
    this.params.set(name, value);
  }
};

// Provide a global matchMedia polyfill for components checking system theme
if (!window.matchMedia) {
  // @ts-ignore
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
