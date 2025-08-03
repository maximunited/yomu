// This file contains test utilities and should not be treated as a test file
// It's imported by other test files to provide common testing functionality

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <DarkModeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </DarkModeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Mock data utilities
export const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  dateOfBirth: new Date('1990-06-15'),
  anniversaryDate: null,
  profilePicture: null,
}

export const mockBenefit = {
  id: 'benefit-1',
  title: 'Birthday Discount',
  description: 'Get 20% off on your birthday',
  brandId: 'brand-1',
  promoCode: 'BIRTHDAY20',
  url: 'https://example.com',
  validityType: 'birthday_exact_date',
  validityDuration: 1,
  redemptionMethod: 'code',
  termsAndConditions: 'Valid only on birthday',
  brand: {
    id: 'brand-1',
    name: 'Test Brand',
    logoUrl: 'https://example.com/logo.png',
    website: 'https://example.com',
  },
}

export const mockBrand = {
  id: 'brand-1',
  name: 'Test Brand',
  logoUrl: 'https://example.com/logo.png',
  website: 'https://example.com',
  description: 'Test brand description',
  category: 'restaurant',
  isActive: true,
}

export const mockMembership = {
  id: 'membership-1',
  userId: 'user-1',
  brandId: 'brand-1',
  isActive: true,
  brand: mockBrand,
}

// API response mocks
export const mockApiResponses = {
  profile: {
    user: mockUser,
  },
  memberships: {
    memberships: [mockMembership],
  },
  benefits: {
    benefits: [mockBenefit],
    memberships: 1,
  },
}

// Test setup utilities
export const setupMockFetch = (responses: any[] = []) => {
  const mockFetch = jest.fn()
  
  if (responses.length > 0) {
    responses.forEach(response => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      })
    })
  } else {
    // Default responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.profile,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.memberships,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.benefits,
      })
  }
  
  global.fetch = mockFetch
  return mockFetch
}

export const setupMockSession = (sessionData: any = null) => {
  const mockUseSession = require('next-auth/react').useSession
  
  if (sessionData) {
    mockUseSession.mockReturnValue(sessionData)
  } else {
    mockUseSession.mockReturnValue({
      data: {
        user: mockUser,
      },
      status: 'authenticated',
    })
  }
}

export const setupMockRouter = () => {
  const mockRouter = require('next/navigation').useRouter
  const mockPush = jest.fn()
  const mockReplace = jest.fn()
  const mockPrefetch = jest.fn()
  
  mockRouter.mockReturnValue({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
  })
  
  return { mockPush, mockReplace, mockPrefetch }
} 