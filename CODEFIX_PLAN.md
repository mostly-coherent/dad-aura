# CodeFix.md Execution Plan for Dad Aura

> **Purpose:** Systematic code review and fix plan using CodeFix.md across critical areas
> **Created:** 2026-01-26
> **Status:** Ready for execution

---

## 🚨 Important: CodeFix.md Must Run in Composer

**CRITICAL:** CodeFix.md MUST be run by Composer (⌘I), NOT Chat. Composer has the multi-file editing capabilities and context needed for comprehensive code review.

**Usage Pattern:**
```
@CodeFix.md on [target path]
```

**Note:** CodeFix.md output format is for response only - DO NOT create .md documentation files unless explicitly requested.

---

## Overview

Dad Aura is a real-time dad performance tracking app with:
- **Backend:** Next.js API routes (TypeScript) for aura events, SMS webhook, flip functionality
- **Frontend:** React components with real-time Supabase subscriptions
- **Database:** Supabase PostgreSQL with real-time subscriptions
- **External Integration:** Vonage SMS webhook for Apple Watch input
- **Features:** Aura scoring, flip power (dad can reverse score), trend analytics, activity feed

**Critical Areas Identified:**
1. API Routes (SMS webhook, aura events, flip operations)
2. Main UI Component (real-time subscriptions, state management)
3. Library Utilities (emoji parsing, flip manager, aura calculator, rate limiter)
4. Configuration (middleware, Next.js config)

---

## Execution Plan

### Phase 1: API Routes (HIGH PRIORITY)

**Why Critical:** API routes handle SMS webhooks, aura events, flip operations, and authentication. Bugs here affect core functionality.

#### 1.1 SMS Webhook Route (`/api/sms-webhook/route.ts`)
**Focus Areas:**
- ✅ Error handling for Vonage webhook requests
- ✅ Edge runtime compatibility (edge runtime limitations)
- ✅ Rate limiting implementation
- ✅ SMS parsing error handling
- ✅ Database insert error handling
- ✅ Always return 200 to Vonage (webhook requirement)
- ✅ Input validation for Vonage payload

**CodeFix Command:**
```
@CodeFix.md on app/api/sms-webhook/route.ts
```

**Expected Issues:**
- Edge runtime compatibility (Intl.Segmenter not available)
- Missing error handling for webhook payload parsing
- Rate limiting edge cases
- Database errors not properly handled

---

#### 1.2 Aura Route (`/api/aura/route.ts`)
**Focus Areas:**
- ✅ Error handling for database queries
- ✅ Input validation (limit parameter, date ranges)
- ✅ Type safety for request/response
- ✅ DELETE operation error handling
- ✅ POST validation (emoji, points, source)

**CodeFix Command:**
```
@CodeFix.md on app/api/aura/route.ts
```

**Expected Issues:**
- Missing validation for limit parameter (could be negative or very large)
- Date range validation missing
- Type safety improvements needed

---

#### 1.3 Flip Route (`/api/flip/route.ts`)
**Focus Areas:**
- ✅ Rate limiting implementation
- ✅ Race conditions in flip operations
- ✅ Total verification logic (timing discrepancies)
- ✅ Error handling for database operations
- ✅ Flip status calculation

**CodeFix Command:**
```
@CodeFix.md on app/api/flip/route.ts
```

**Expected Issues:**
- Race conditions if flip called multiple times concurrently
- Timing discrepancy handling (10 point threshold)
- Missing error handling for database operations

---

#### 1.4 Flip Config Route (`/api/flip-config/route.ts`)
**Focus Areas:**
- ✅ Input validation (max flips per day: 0-10)
- ✅ Error handling for database operations
- ✅ Authorization checks (son only)

**CodeFix Command:**
```
@CodeFix.md on app/api/flip-config/route.ts
```

**Expected Issues:**
- Missing input validation
- Missing authorization checks

---

#### 1.5 Auth Routes (`/api/login/route.ts`, `/api/logout/route.ts`)
**Focus Areas:**
- ✅ Authentication logic
- ✅ Session management
- ✅ Error handling
- ✅ Security: password validation, cookie settings

**CodeFix Commands:**
```
@CodeFix.md on app/api/login/route.ts
@CodeFix.md on app/api/logout/route.ts
```

**Expected Issues:**
- Missing error handling
- Cookie security settings
- Password validation

---

#### 1.6 Dad Tribunal Route (`/api/dad-tribunal/route.ts`)
**Focus Areas:**
- ✅ Error handling
- ✅ Input validation
- ✅ Database operations

**CodeFix Command:**
```
@CodeFix.md on app/api/dad-tribunal/route.ts
```

---

### Phase 2: Main UI Component (HIGH PRIORITY)

**Why Critical:** Main component handles real-time subscriptions, state management, and user interactions. Bugs here affect user experience.

#### 2.1 Main Page Component (`app/page.tsx`)
**Focus Areas:**
- ✅ React hooks dependencies (useEffect, useCallback)
- ✅ Real-time subscription cleanup (memory leaks)
- ✅ State updates after unmount protection
- ✅ Error handling for Supabase queries
- ✅ Null/undefined checks for stats data
- ✅ Race conditions in async operations

**CodeFix Command:**
```
@CodeFix.md on app/page.tsx
```

**Expected Issues:**
- Missing cleanup for real-time subscriptions
- State updates after unmount
- Missing error handling in async operations
- Missing null checks for stats

---

### Phase 3: Library Utilities (MEDIUM PRIORITY)

**Why Important:** Utilities are shared across the app. Bugs here affect multiple components.

#### 3.1 Emoji Parser (`lib/emoji-parser.ts`)
**Focus Areas:**
- ✅ Edge runtime compatibility (Intl.Segmenter fallback)
- ✅ Input validation
- ✅ Emoji normalization edge cases
- ✅ Error handling for parsing failures

**CodeFix Command:**
```
@CodeFix.md on lib/emoji-parser.ts
```

**Expected Issues:**
- Edge runtime compatibility (Intl.Segmenter not available)
- Missing input validation
- Emoji parsing edge cases

---

#### 3.2 Flip Manager (`lib/flip-manager.ts`)
**Focus Areas:**
- ✅ Race conditions in flip operations
- ✅ Date handling (timezone issues)
- ✅ Error handling for database operations
- ✅ Transaction safety (multi-step operations)

**CodeFix Command:**
```
@CodeFix.md on lib/flip-manager.ts
```

**Expected Issues:**
- Race conditions in concurrent flips
- Missing error handling
- Date timezone issues

---

#### 3.3 Aura Calculator (`lib/aura-calculator.ts`)
**Focus Areas:**
- ✅ Null/undefined checks for events array
- ✅ Date calculations (timezone handling)
- ✅ Edge cases (empty arrays, invalid dates)
- ✅ Performance (large event sets)

**CodeFix Command:**
```
@CodeFix.md on lib/aura-calculator.ts
```

**Expected Issues:**
- Missing null checks
- Date calculation edge cases
- Performance with large datasets

---

#### 3.4 Rate Limiter (`lib/rate-limiter.ts`)
**Focus Areas:**
- ✅ Edge runtime compatibility
- ✅ Memory management (rate limit storage)
- ✅ Error handling

**CodeFix Command:**
```
@CodeFix.md on lib/rate-limiter.ts
```

**Expected Issues:**
- Edge runtime compatibility (in-memory storage limitations)
- Memory leaks from rate limit storage

---

#### 3.5 Supabase Client (`lib/supabase.ts`)
**Focus Areas:**
- ✅ Client initialization
- ✅ Error handling
- ✅ Type safety

**CodeFix Command:**
```
@CodeFix.md on lib/supabase.ts
```

---

### Phase 4: React Components (MEDIUM PRIORITY)

**Why Important:** Components handle UI interactions and data display.

#### 4.1 Key Components
**Focus Areas:**
- ✅ React hooks dependencies
- ✅ Props validation
- ✅ Error handling
- ✅ Null/undefined checks

**CodeFix Commands:**
```
@CodeFix.md on components/AuraScore.tsx
@CodeFix.md on components/DadFlipButton.tsx
@CodeFix.md on components/FlipConfigPanel.tsx
@CodeFix.md on components/ActivityFeed.tsx
@CodeFix.md on components/AuraTrends.tsx
```

**Expected Issues:**
- Missing useEffect dependencies
- Missing null checks for props
- Missing error states

---

### Phase 5: Configuration Files (LOW PRIORITY)

**Why Important:** Configuration affects app behavior.

#### 5.1 Middleware (`middleware.ts`)
**Focus Areas:**
- ✅ Error handling
- ✅ Route protection logic
- ✅ Cookie handling

**CodeFix Command:**
```
@CodeFix.md on middleware.ts
```

---

#### 5.2 Next.js Config (`next.config.js`)
**Focus Areas:**
- ✅ Configuration correctness

**CodeFix Command:**
```
@CodeFix.md on next.config.js
```

---

## Execution Order

**Recommended Sequence:**

1. **Phase 1.1** - SMS Webhook Route (most critical, external integration)
2. **Phase 1.2** - Aura Route (core data operations)
3. **Phase 1.3** - Flip Route (complex business logic)
4. **Phase 1.4-1.6** - Other API Routes
5. **Phase 2.1** - Main UI Component (real-time subscriptions)
6. **Phase 3** - Library Utilities (shared code)
7. **Phase 4** - React Components
8. **Phase 5** - Configuration

**Total Estimated Time:** 2-3 hours (depending on number of issues found)

---

## Success Criteria

**After CodeFix execution, verify:**

- ✅ All compilation errors fixed
- ✅ All TypeScript type errors resolved
- ✅ All linting errors fixed
- ✅ Tests pass (if tests exist)
- ✅ No runtime errors in browser console
- ✅ Critical user flows work (SMS webhook, aura display, flip functionality)
- ✅ Error states handled gracefully
- ✅ Loading states present for async operations
- ✅ Real-time subscriptions properly cleaned up

---

## Known Critical Areas

### Edge Runtime Compatibility
- SMS webhook uses Edge runtime
- `Intl.Segmenter` not available in Edge runtime
- Emoji parser has fallback, but needs verification

### Real-Time Subscriptions
- Supabase real-time subscriptions need proper cleanup
- Memory leaks possible if subscriptions not unsubscribed

### Race Conditions
- Flip operations can be called concurrently
- Need transaction safety or locking mechanism

### External Integration
- Vonage webhook must always return 200 OK
- Error handling must not break webhook acknowledgment

---

## Notes

- **SMS Webhook:** Must always return 200 OK to Vonage (even on errors)
- **Edge Runtime:** SMS webhook uses Edge runtime - check compatibility
- **Real-Time:** Main component uses Supabase real-time - verify cleanup
- **Rate Limiting:** In-memory rate limiting may not work in Edge runtime
- **Flip Operations:** Complex business logic with race condition risks

---

**Last Updated:** 2026-01-26
**Status:** Ready for execution
