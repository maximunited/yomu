import {
  VALIDITY_TYPES,
  LEGACY_VALIDITY_TYPES,
  validateBenefitData,
  getValidityDisplayText,
  isBenefitActive,
  getUpcomingBenefits,
  ALL_VALIDITY_TYPES,
} from '@/lib/benefit-validation'

describe('Benefit Validation', () => {
  describe('VALIDITY_TYPES', () => {
    it('should contain all expected validity types', () => {
      const expectedTypes = [
        'birthday_exact_date',
        'birthday_entire_month',
        'birthday_week_before_after',
        'birthday_weekend',
        'birthday_30_days',
        'birthday_7_days_before',
        'birthday_7_days_after',
        'birthday_3_days_before',
        'birthday_3_days_after',
        'anniversary_exact_date',
        'anniversary_entire_month',
        'anniversary_week_before_after',
      ]

      expectedTypes.forEach(type => {
        expect(VALIDITY_TYPES[type]).toBeDefined()
        expect(VALIDITY_TYPES[type].validityType).toBe(type)
        expect(VALIDITY_TYPES[type].description).toBeDefined()
        expect(VALIDITY_TYPES[type].validationLogic).toBeDefined()
        expect(VALIDITY_TYPES[type].displayText).toBeDefined()
      })
    })
  })

  describe('LEGACY_VALIDITY_TYPES', () => {
    it('should map legacy types to new types', () => {
      expect(LEGACY_VALIDITY_TYPES['birthday_date']).toBe('birthday_exact_date')
      expect(LEGACY_VALIDITY_TYPES['birthday_month']).toBe('birthday_entire_month')
      expect(LEGACY_VALIDITY_TYPES['birthday_week']).toBe('birthday_week_before_after')
    })
  })

  describe('validateBenefitData', () => {
    it('should validate correct benefit data', () => {
      const validBenefit = {
        title: 'Test Benefit',
        description: 'Test Description',
        brandId: 'brand-1',
        redemptionMethod: 'code',
        validityType: 'birthday_exact_date',
        validityDuration: 30,
      }

      const result = validateBenefitData(validBenefit)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject benefit data with missing required fields', () => {
      const invalidBenefit = {
        title: '',
        description: '',
        brandId: '',
        redemptionMethod: '',
        validityType: 'invalid_type',
      }

      const result = validateBenefitData(invalidBenefit)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Title is required')
      expect(result.errors).toContain('Description is required')
      expect(result.errors).toContain('Brand ID is required')
      expect(result.errors).toContain('Redemption method is required')
      expect(result.errors.some(error => error.includes('Invalid validity type: invalid_type'))).toBe(true)
    })

    it('should reject invalid validity types', () => {
      const invalidBenefit = {
        title: 'Test Benefit',
        description: 'Test Description',
        brandId: 'brand-1',
        redemptionMethod: 'code',
        validityType: 'invalid_type',
      }

      const result = validateBenefitData(invalidBenefit)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('Invalid validity type: invalid_type'))).toBe(true)
    })

    it('should accept legacy validity types', () => {
      const legacyBenefit = {
        title: 'Test Benefit',
        description: 'Test Description',
        brandId: 'brand-1',
        redemptionMethod: 'code',
        validityType: 'birthday_date',
      }

      const result = validateBenefitData(legacyBenefit)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate validity duration type', () => {
      const invalidBenefit = {
        title: 'Test Benefit',
        description: 'Test Description',
        brandId: 'brand-1',
        redemptionMethod: 'code',
        validityType: 'birthday_exact_date',
        validityDuration: 'not_a_number',
      }

      const result = validateBenefitData(invalidBenefit)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Validity duration must be a number')
    })
  })

  describe('getValidityDisplayText', () => {
    it('should return correct display text for valid types', () => {
      expect(getValidityDisplayText('birthday_exact_date', 'he')).toBe('תקף ביום ההולדת בלבד')
      expect(getValidityDisplayText('birthday_entire_month', 'he')).toBe('תקף לכל החודש')
      expect(getValidityDisplayText('birthday_week_before_after', 'he')).toBe('תקף לשבוע לפני ואחרי')
    })

    it('should handle legacy types', () => {
      expect(getValidityDisplayText('birthday_date', 'he')).toBe('תקף ביום ההולדת בלבד')
      expect(getValidityDisplayText('birthday_month', 'he')).toBe('תקף לכל החודש')
      expect(getValidityDisplayText('birthday_week', 'he')).toBe('תקף לשבוע לפני ואחרי')
    })

    it('should return default text for unknown types', () => {
      expect(getValidityDisplayText('unknown_type', 'he')).toBe('תקף לתקופה מוגבלת')
    })
  })

  describe('isBenefitActive', () => {
    const userDOB = new Date('1990-06-15') // June 15th

    it('should return false when user has no DOB', () => {
      const benefit = { validityType: 'birthday_exact_date' }
      const result = isBenefitActive(benefit, null)
      expect(result).toBe(false)
    })

    it('should validate birthday_exact_date correctly', () => {
      const benefit = { validityType: 'birthday_exact_date' }
      
      // On birthday
      const birthdayDate = new Date('2024-06-15')
      expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true)
      
      // Day before birthday
      const dayBefore = new Date('2024-06-14')
      expect(isBenefitActive(benefit, userDOB, dayBefore)).toBe(false)
      
      // Day after birthday
      const dayAfter = new Date('2024-06-16')
      expect(isBenefitActive(benefit, userDOB, dayAfter)).toBe(false)
    })

    it('should validate birthday_entire_month correctly', () => {
      const benefit = { validityType: 'birthday_entire_month' }
      
      // In birthday month
      const inBirthdayMonth = new Date('2024-06-20')
      expect(isBenefitActive(benefit, userDOB, inBirthdayMonth)).toBe(true)
      
      // Different month
      const differentMonth = new Date('2024-07-15')
      expect(isBenefitActive(benefit, userDOB, differentMonth)).toBe(false)
    })

    it('should validate birthday_week_before_after correctly', () => {
      const benefit = { validityType: 'birthday_week_before_after' }
      
      // On birthday
      const birthdayDate = new Date('2024-06-15')
      expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true)
      
      // 7 days before
      const weekBefore = new Date('2024-06-08')
      expect(isBenefitActive(benefit, userDOB, weekBefore)).toBe(true)
      
      // 7 days after
      const weekAfter = new Date('2024-06-22')
      expect(isBenefitActive(benefit, userDOB, weekAfter)).toBe(true)
      
      // 8 days before (should be false)
      const tooEarly = new Date('2024-06-07')
      expect(isBenefitActive(benefit, userDOB, tooEarly)).toBe(false)
      
      // 8 days after (should be false)
      const tooLate = new Date('2024-06-23')
      expect(isBenefitActive(benefit, userDOB, tooLate)).toBe(false)
    })

    it('should handle legacy types', () => {
      const benefit = { validityType: 'birthday_date' }
      const birthdayDate = new Date('2024-06-15')
      expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(true)
    })

    it('should return false for unknown types', () => {
      const benefit = { validityType: 'unknown_type' }
      const birthdayDate = new Date('2024-06-15')
      expect(isBenefitActive(benefit, userDOB, birthdayDate)).toBe(false)
    })
  })

  describe('getUpcomingBenefits', () => {
    const userDOB = new Date('1990-06-15') // June 15th

    it('should return false when user has no DOB', () => {
      const benefit = { validityType: 'birthday_exact_date' }
      const result = getUpcomingBenefits(benefit, null)
      expect(result).toBe(false)
    })

    it('should validate birthday_exact_date upcoming correctly', () => {
      const benefit = { validityType: 'birthday_exact_date' }
      
      // More than 7 days before birthday
      const farBefore = new Date('2024-06-07')
      expect(getUpcomingBenefits(benefit, userDOB, farBefore)).toBe(true)
      
      // Within 7 days of birthday
      const nearBirthday = new Date('2024-06-10')
      expect(getUpcomingBenefits(benefit, userDOB, nearBirthday)).toBe(false)
      
      // Different month
      const differentMonth = new Date('2024-07-15')
      expect(getUpcomingBenefits(benefit, userDOB, differentMonth)).toBe(true)
    })

    it('should validate birthday_entire_month upcoming correctly', () => {
      const benefit = { validityType: 'birthday_entire_month' }
      
      // Different month
      const differentMonth = new Date('2024-07-15')
      expect(getUpcomingBenefits(benefit, userDOB, differentMonth)).toBe(true)
      
      // Same month
      const sameMonth = new Date('2024-06-20')
      expect(getUpcomingBenefits(benefit, userDOB, sameMonth)).toBe(false)
    })

    it('should return false for unknown types', () => {
      const benefit = { validityType: 'unknown_type' }
      const testDate = new Date('2024-06-15')
      expect(getUpcomingBenefits(benefit, userDOB, testDate)).toBe(false)
    })
  })

  describe('ALL_VALIDITY_TYPES', () => {
    it('should contain all validity types', () => {
      expect(ALL_VALIDITY_TYPES).toContain('birthday_exact_date')
      expect(ALL_VALIDITY_TYPES).toContain('birthday_entire_month')
      expect(ALL_VALIDITY_TYPES).toContain('birthday_week_before_after')
      expect(ALL_VALIDITY_TYPES).toContain('anniversary_exact_date')
    })

    it('should have the same length as VALIDITY_TYPES keys', () => {
      expect(ALL_VALIDITY_TYPES).toHaveLength(Object.keys(VALIDITY_TYPES).length)
    })
  })
}) 