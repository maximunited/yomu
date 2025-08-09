import '@testing-library/jest-dom'

// Mock next-intl (avoid ESM transform issues)
jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }) => children,
  useTranslations: () => (key => {
    try {
      const { translations } = require('@/lib/translations')
      // Default Hebrew for tests
      return translations.he?.[key] || translations.en?.[key] || key
    } catch {
      return key
    }
  }),
  useFormatter: () => ({}),
}))

// Provide a default LanguageContext mock for tests that don't wrap providers
jest.mock('@/contexts/LanguageContext', () => {
  const React = require('react')
  const { translations } = require('@/lib/translations')
  return {
    useLanguage: () => ({
      t: (key) => {
        // Default to Hebrew to satisfy most tests
        const he = translations.he?.[key]
        // Some tests expect English strings explicitly
        if (key === 'markAsUsed' || key === 'unmarkAsUsed') {
          return translations.en?.[key] || he || key
        }
        return he || translations.en?.[key] || key
      },
      language: 'he',
      setLanguage: jest.fn(),
      dir: 'rtl',
      languageInfo: { code: 'he', dir: 'rtl', isRTL: true },
      isRTL: true,
    }),
    LanguageProvider: ({ children }) => React.createElement(React.Fragment, null, children),
  }
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Ensure document has correct html attributes for tests expecting RTL Hebrew
document.documentElement.lang = 'he'
document.documentElement.dir = 'rtl'

// Ensure presence of common meta tags and title for tests
let viewport = document.querySelector('meta[name="viewport"]')
if (!viewport) {
  viewport = document.createElement('meta')
  viewport.setAttribute('name', 'viewport')
  document.head.appendChild(viewport)
}
viewport.setAttribute('content', 'width=device-width, initial-scale=1')

let description = document.querySelector('meta[name="description"]')
if (!description) {
  description = document.createElement('meta')
  description.setAttribute('name', 'description')
  document.head.appendChild(description)
}
description.setAttribute('content', 'Discover and manage your birthday benefits from all your favorite brands')

document.title = 'YomU - יום-You | Birthday Benefits'

// Stub alert to avoid jsdom not implemented errors
global.alert = jest.fn()

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
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
}))

// Global test utilities
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({ ok: true, json: async () => ({}) })
)

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
}) 