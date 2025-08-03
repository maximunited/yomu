# Used Benefits Feature

## Overview

The Used Benefits feature allows users to mark which benefits they have used, providing a way to track their benefit usage history and avoid confusion about which benefits have been redeemed.

## Features

### 1. Mark Benefits as Used
- Users can mark any benefit as "used" by clicking the "Mark as Used" button on benefit cards
- This creates a record in the database with the current timestamp
- The benefit card will show a visual indicator that it has been used

### 2. Unmark Benefits as Used
- Users can unmark benefits as used by clicking the "Unmark as Used" button
- This removes the used benefit record from the database
- The benefit card will no longer show the used indicator

### 3. Used Benefits History
- A dedicated section shows all benefits that have been marked as used
- Displays the brand name, benefit title, and usage date
- Users can quickly unmark benefits from this history section

### 4. Visual Indicators
- Used benefits show a gray badge with "Used on [date]"
- Used benefits have a different button style (filled vs outline)
- The used benefits history section only appears when there are used benefits

## Database Schema

### UsedBenefit Model
```prisma
model UsedBenefit {
  id          String   @id @default(cuid())
  userId      String
  benefitId   String
  usedAt      DateTime @default(now())
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now()) @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  benefit     Benefit  @relation(fields: [benefitId], references: [id], onDelete: Cascade)

  @@unique([userId, benefitId])
  @@map("used_benefits")
}
```

## API Endpoints

### GET /api/user/used-benefits
- Returns all used benefits for the current user
- Includes benefit and brand information
- Ordered by usage date (most recent first)

### POST /api/user/used-benefits
- Marks a benefit as used
- Body: `{ benefitId: string, notes?: string }`
- Creates or updates the used benefit record

### DELETE /api/user/used-benefits/[id]
- Unmarks a benefit as used
- Deletes the used benefit record for the specified benefit ID

## UI Components

### Dashboard Integration
- Used benefits functionality is integrated into the main dashboard
- Benefit cards show "Mark as Used" or "Unmark as Used" buttons
- Used benefits display a visual indicator
- Used benefits history section appears when there are used benefits

### Translation Support
- All text is translatable using the existing i18n system
- Hebrew and English translations are provided
- Translation keys include:
  - `markAsUsed`
  - `unmarkAsUsed`
  - `usedBenefits`
  - `usedOn`
  - `usedBenefitsHistory`
  - And more...

## Usage

1. **Mark a Benefit as Used**:
   - Navigate to the dashboard
   - Find a benefit you want to mark as used
   - Click the "Mark as Used" button
   - The benefit will show a "Used on [date]" indicator

2. **Unmark a Benefit as Used**:
   - Click the "Unmark as Used" button on a used benefit
   - The used indicator will disappear
   - The benefit will return to the unused state

3. **View Used Benefits History**:
   - Scroll down to the "Used Benefits History" section
   - View all benefits you've marked as used
   - Quickly unmark benefits from this section

## Technical Implementation

### State Management
- Uses React state to track used benefits
- Fetches used benefits on component mount
- Updates state when marking/unmarking benefits

### API Integration
- RESTful API endpoints for CRUD operations
- Proper error handling and loading states
- Authentication required for all operations

### Database Relations
- UsedBenefit model has relations to User and Benefit models
- Unique constraint prevents duplicate used benefit records
- Cascade deletes ensure data consistency

## Future Enhancements

1. **Notes Feature**: Allow users to add notes when marking benefits as used
2. **Usage Analytics**: Track usage patterns and provide insights
3. **Export History**: Allow users to export their used benefits history
4. **Bulk Operations**: Mark multiple benefits as used at once
5. **Usage Reminders**: Notify users about unused benefits before they expire

## Testing

The feature includes comprehensive tests covering:
- Marking benefits as used
- Unmarking benefits as used
- API integration
- UI state management
- Visual indicators

Run tests with: `npm test -- --testPathPattern=used-benefits.test.tsx` 