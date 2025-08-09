import '@testing-library/jest-dom'

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
global.fetch = jest.fn()

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
}) 