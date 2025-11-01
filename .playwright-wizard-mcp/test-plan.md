# Test Plan - Amateur El Clásico

**Project:** Amateur El Clásico (Football Match Management)  
**Framework:** Next.js 14 + Zustand + JWT Auth  
**Total Suites:** 6  
**Total Tests:** ~48  
**Progress:** 0/6 suites (0%)

> **Note:** This plan is based on analysis from Step 1 (Analyze App)

---

## Critical User Journeys (E2E)

### Journey 1: Admin Match Management (P0)
**Pages:** Login → Admin Panel → Create Match → Verify → Edit Match → Delete  
**Why Critical:** Core feature - match CRUD operations  
**File:** `tests/e2e/admin-match-flow.spec.ts`  
**Tests:** 3

**Flow:**
1. Admin logs in with valid credentials
2. Creates new match with date, time, location
3. Edits match to add scores and lineups
4. Deletes test match
5. Expected: All operations succeed, data persists correctly

### Journey 2: Public User Experience (P1)
**Pages:** Home → Schedule → Match Detail → History  
**Why Critical:** Main user journey for viewing matches  
**File:** `tests/e2e/public-browse-flow.spec.ts`  
**Tests:** 2

**Flow:**
1. Visitor lands on homepage, sees statistics
2. Views upcoming match countdown
3. Navigates to match detail
4. Checks team lineups and scores
5. Expected: All data displays correctly, navigation works

---

## Implementation Status

**How to use:** As you complete each suite in Step 5, mark it with `[x]`

- [ ] **auth.spec.ts** - Authentication flows (P0)
  - Tests: 9
  - Dependencies: Test admin/player accounts, JWT token handling
  - Estimated time: 2-3 hours
  
- [ ] **home.spec.ts** - Homepage and statistics (P1)
  - Tests: 8
  - Dependencies: Match data with completed/scheduled matches
  - Estimated time: 2 hours
  
- [ ] **match-detail.spec.ts** - Match detail pages (P1)
  - Tests: 7
  - Dependencies: Match data with lineups and scores
  - Estimated time: 2 hours
  
- [ ] **admin-panel.spec.ts** - Admin dashboard (P0)
  - Tests: 12
  - Dependencies: Auth fixture (admin user), match CRUD operations
  - Estimated time: 4-5 hours

- [ ] **admin-match-crud.spec.ts** - Create/Edit/Delete matches (P0)
  - Tests: 9
  - Dependencies: Auth fixture, unique test data per worker
  - Estimated time: 3-4 hours

- [ ] **e2e/admin-match-flow.spec.ts** - End-to-end admin flow (P0)
  - Tests: 3
  - Dependencies: Full integration, clean database state
  - Estimated time: 2 hours

---

## Test Coverage Summary

| Feature Area        | Test Suite              | Tests | Priority | Status  |
| ------------------- | ----------------------- | ----- | -------- | ------- |
| Authentication      | auth.spec.ts            | 9     | P0       | ⏳ Todo |
| Homepage            | home.spec.ts            | 8     | P1       | ⏳ Todo |
| Match Detail        | match-detail.spec.ts    | 7     | P1       | ⏳ Todo |
| Admin Panel         | admin-panel.spec.ts     | 12    | P0       | ⏳ Todo |
| Admin CRUD          | admin-match-crud.spec.ts | 9    | P0       | ⏳ Todo |
| E2E Flow            | admin-match-flow.spec.ts | 3    | P0       | ⏳ Todo |
| **Total**           | **6 suites**            | **48**| **4 P0** | **0%**  |

**Update this table as tests are implemented in Step 5**

---

## Suite 1: auth.spec.ts

**Priority:** P0 (Critical)  
**Why:** Required for admin features and protected routes  
**Estimated time:** 2-3 hours

**Test Cases:**

1. ✅ **Successful login - admin user** → Redirect to homepage, admin link visible
2. ✅ **Successful login - player user** → Redirect to homepage, no admin link
3. ✅ **Failed login - invalid username** → Show "Ошибка входа" error message
4. ✅ **Failed login - wrong password** → Show authentication error
5. ✅ **Successful registration** → New player account created, auto-login
6. ✅ **Failed registration - username taken** → Show error message
7. ✅ **Logout functionality** → Clear session, redirect to homepage
8. ✅ **Protected route - admin panel** → Redirect to login when not authenticated
9. ✅ **Protected route - admin panel** → Redirect to login when player user tries access

**Dependencies:**
- Test accounts:
  - Admin: `test-admin` / `TestAdmin123!`
  - Player: `test-player` / `TestPlayer123!`
  - New user: `new-user-${workerId}` / `NewPass123!`
- JWT token handling in localStorage
- Clean auth state between tests (logout in afterEach)

**Suite-Specific Considerations:**
- Test JWT token expiration handling
- Verify token stored in Zustand + localStorage
- Test concurrent login sessions (different workers)
- Verify role-based access control (ADMIN vs PLAYER)

**Selector Strategy:**
- ✅ Login page has good labels: `getByLabel('Имя пользователя')`
- ✅ Buttons semantic: `getByRole('button', {name: /Войти/})`
- ✅ Error messages: `getByText('Ошибка входа')`

---

## Suite 2: home.spec.ts

**Priority:** P1 (High)  
**Why:** Main landing page, first user impression  
**Estimated time:** 2 hours

**Test Cases:**

1. ✅ **Homepage loads** → Hero section visible with "AMATEUR EL CLÁSICO"
2. ✅ **Statistics display** → Real wins, Barca wins, draws, goals shown
3. ✅ **Upcoming match section** → Next match displayed with countdown timer
4. ✅ **No upcoming match** → Show "Нет запланированных матчей" message
5. ✅ **Recent matches section** → Last 3 completed matches displayed
6. ✅ **Match card click** → Navigate to match detail page
7. ✅ **CTA buttons** → "Смотреть расписание" navigates to /schedule
8. ✅ **Loading state** → Show "Загрузка..." before data loads

**Dependencies:**
- Match data:
  - At least 3 completed matches (with scores)
  - 1 upcoming match (scheduled)
  - Various dates for proper sorting
- API endpoint `/api/matches` working

**Suite-Specific Considerations:**
- Test with empty database (no matches)
- Verify statistics calculations are correct
- Test countdown timer updates (mock time if needed)
- Check Framer Motion animations don't break tests

**Selector Strategy:**
- ⚠️ May need test IDs for specific match cards: `data-testid="match-card-${id}"`
- ✅ Statistics: `getByText('Побед Реала')`
- ✅ Navigation: `getByRole('link', {name: 'Расписание'})`

---

## Suite 3: match-detail.spec.ts

**Priority:** P1 (High)  
**Why:** Key feature for viewing match information  
**Estimated time:** 2 hours

**Test Cases:**

1. ✅ **Completed match detail** → Shows final score, date, location
2. ✅ **Completed match - winner highlight** → Real Madrid win shows gold gradient
3. ✅ **Completed match - winner highlight** → Barcelona win shows blue/red gradient
4. ✅ **Completed match - draw** → Both teams equal styling
5. ✅ **Scheduled match detail** → Shows countdown, no scores
6. ✅ **Team lineups display** → Both Real and Barca lineups visible
7. ✅ **Invalid match ID** → Show 404 or error message

**Dependencies:**
- Match data with various states:
  - Completed match (Real wins)
  - Completed match (Barca wins)
  - Completed match (draw)
  - Scheduled match (future date)
  - Match with full lineups
- Dynamic route `/match/[id]` working

**Suite-Specific Considerations:**
- Test date formatting (Russian locale with date-fns)
- Verify score display format
- Test lineup parsing (multiline text)
- Handle invalid/non-existent match IDs gracefully

**Selector Strategy:**
- ✅ Score: `getByText(/\d+:\d+/)`
- ✅ Date: `getByText(/\d+ \w+ \d{4}/)`
- ⚠️ Lineups may need structure verification

---

## Suite 4: admin-panel.spec.ts

**Priority:** P0 (Critical)  
**Why:** Core admin functionality for managing site  
**Estimated time:** 4-5 hours

**Test Cases:**

1. ✅ **Admin panel loads** → Shows tabs: Matches, Users, Settings
2. ✅ **Tab navigation - Matches** → Display list of all matches
3. ✅ **Tab navigation - Users** → Display user list (if implemented)
4. ✅ **Tab navigation - Settings** → Display settings panel
5. ✅ **Search functionality** → Filter matches by location or date
6. ✅ **Match list displays** → All matches shown with date, location, status
7. ✅ **Quick status update** → Change match status from scheduled to completed
8. ✅ **Edit button** → Navigate to edit match page
9. ✅ **Delete button** → Show confirmation, delete match
10. ✅ **Create match button** → Navigate to create page
11. ✅ **Upcoming vs Completed filter** → Shows correct match groups
12. ✅ **Empty state** → Show message when no matches found

**Dependencies:**
- Admin user authentication fixture
- Match data:
  - Mix of scheduled and completed
  - Various locations for search testing
- Test IDs required (score 55%) - see selector-strategy.md

**Suite-Specific Considerations:**
- **CRITICAL:** Add test IDs before implementing tests
- Test concurrent admin operations (multiple workers)
- Verify delete confirmation dialog
- Test tab state persistence
- Verify search is case-insensitive

**Selector Strategy (After Test IDs Added):**
```typescript
// Tabs
await page.getByTestId('admin-tab-matches').click();
await page.getByTestId('admin-tab-users').click();

// Search
await page.getByTestId('admin-search-input').fill('Стадион');

// Match actions
await page.getByTestId('admin-edit-match-4').click();
await page.getByTestId('admin-delete-match-4').click();
await page.getByTestId('admin-status-4').selectOption('completed');
```

**⚠️ BLOCKER:** Must implement test IDs from selector-strategy.md first!

---

## Suite 5: admin-match-crud.spec.ts

**Priority:** P0 (Critical)  
**Why:** Core admin functionality - data management  
**Estimated time:** 3-4 hours

**Test Cases:**

1. ✅ **Create match - valid data** → Match created, redirects to admin panel
2. ✅ **Create match - missing required fields** → Show validation errors
3. ✅ **Create match - past date** → Allow (historical matches)
4. ✅ **Edit match - update date/time** → Changes saved, displayed correctly
5. ✅ **Edit match - add scores** → Status auto-changes to completed (if logic exists)
6. ✅ **Edit match - add lineups** → Lineups saved and displayed
7. ✅ **Edit match - change status** → Status updated successfully
8. ✅ **Delete match - confirm** → Match removed from database
9. ✅ **Delete match - cancel** → Match remains unchanged

**Dependencies:**
- Admin auth fixture
- Unique test data per worker to avoid conflicts:
  ```typescript
  const matchData = {
    date: `2025-12-${10 + workerId}`,
    time: '18:00',
    location: `Test Stadium ${workerId}`
  };
  ```
- API endpoints working:
  - `POST /api/matches`
  - `PUT /api/matches/[id]`
  - `DELETE /api/matches/[id]`

**Suite-Specific Considerations:**
- Generate unique match data per worker (avoid conflicts)
- Clean up created matches in afterEach
- Test form validation (required fields, date format)
- Verify Russian locale for date/time inputs
- Test textarea lineups (multiline text)

**Selector Strategy:**
- ✅ Create/Edit forms have labels: `getByLabel('Дата')`
- ⚠️ Add test IDs for lineups: `data-testid="lineup-real-textarea"`
- ✅ Submit: `getByRole('button', {name: 'Создать матч'})`

---

## Suite 6: e2e/admin-match-flow.spec.ts

**Priority:** P0 (Critical)  
**Why:** Validates complete admin workflow  
**Estimated time:** 2 hours

**Test Cases:**

1. ✅ **Complete admin flow - create to delete**
   - Login as admin
   - Navigate to admin panel
   - Create new match with full details
   - Verify match appears in list
   - Edit match to add scores and lineups
   - Verify changes on match detail page
   - Delete match
   - Verify match removed

2. ✅ **Complete match lifecycle**
   - Create scheduled match
   - Verify shows on homepage as "upcoming"
   - Edit to mark completed with scores
   - Verify moves to "recent matches" on homepage
   - Check statistics updated (wins/goals)

3. ✅ **Error recovery flow**
   - Attempt to create match with invalid data
   - Fix validation errors
   - Successfully create
   - Attempt to delete while on edit page (edge case)

**Dependencies:**
- Full integration environment
- Clean database state (use separate test DB)
- All API endpoints functional
- Both admin panel and public pages working

**Suite-Specific Considerations:**
- Longer timeouts (multi-step flows)
- Comprehensive data validation
- Test cross-page state consistency
- Verify Zustand store updates correctly
- Check localStorage persistence

**Selector Strategy:**
- Combine all strategies from individual suites
- End-to-end verification of data flow

---

## Universal Quality Gates

**All test suites must meet these criteria:**

- ✅ Tests pass with `--workers=4` (parallel execution)
- ✅ Tests pass with `--workers=1` (serial execution)
- ✅ No `.only` or `.skip` in committed code
- ✅ Web-first assertions used (`expect(locator).toBeVisible()`)
- ✅ No `waitForTimeout` - use `waitFor` with condition
- ✅ Follow selector strategy from selector-strategy.md
- ✅ Each test is independent (no order dependency)
- ✅ Proper cleanup (delete test matches in afterEach)
- ✅ Descriptive test names (what is tested, expected outcome)
- ✅ Comments only for complex business logic

---

## Test Data Strategy

**Based on JSON file database from project-config.md:**

### Worker Isolation Pattern

```typescript
// Each worker uses unique test data
const workerId = test.info().parallelIndex;

test('create match', async ({ page, adminAuth }) => {
  const matchData = {
    date: `2025-12-${10 + workerId}`,
    time: '18:00',
    location: `Test Stadium ${workerId}`,
    status: 'scheduled'
  };
  
  // No conflicts with other workers
});
```

### Standard Test Accounts

```typescript
// Admin user (for admin tests)
{
  username: 'admin',
  password: 'admin123',
  role: 'ADMIN'
}

// Player user (for public tests)
{
  username: 'testplayer',
  password: 'TestPass123!',
  role: 'PLAYER'
}

// New user (for registration tests)
{
  username: `newuser-${workerId}`,
  password: 'NewPass123!'
}
```

### Sample Match Data

```typescript
// Completed match (Real wins)
{
  id: 1001,
  match_datetime: '2025-10-15T18:00:00Z',
  location: 'Стадион "Центральный"',
  status: 'completed',
  score_real: 3,
  score_barca: 2,
  lineup_real: 'Вратарь: Иванов...',
  lineup_barca: 'Вратарь: García...'
}

// Scheduled match
{
  id: 1002,
  match_datetime: '2025-12-20T19:00:00Z',
  location: 'Стадион "Динамо"',
  status: 'scheduled',
  score_real: null,
  score_barca: null
}
```

### Database Management

```typescript
// Use separate test database
const TEST_DB_PATH = 'data/test-elclasico.json';

// Reset before test suite
beforeAll(async () => {
  await resetTestDatabase();
});

// Clean up after each test
afterEach(async ({ page }) => {
  // Delete created test matches
  await cleanupTestMatches(workerId);
  
  // Logout if authenticated
  await page.goto('/');
  await page.getByText('Выход').click();
});
```

---

## Pre-Implementation Checklist

**Before proceeding to Step 3 (Setup Infrastructure):**

- [ ] Review this test plan with stakeholders
- [ ] Verify all critical user flows covered
- [ ] Confirm P0 tests align with business priorities
- [ ] Validate test data strategy (JSON file + worker isolation)
- [ ] **CRITICAL:** Plan to add test IDs to admin panel (see selector-strategy.md)
- [ ] Confirm API endpoints documented and working
- [ ] Verify date/time handling (Russian locale)
- [ ] Plan test database separate from production data

**Known Blockers:**
- ❌ Admin panel needs test IDs (55% quality score)
- ⚠️ Match cards may need test IDs for reliable targeting
- ⚠️ Lineup textareas could use test IDs

**Recommended Next Steps:**
1. Implement test IDs in `app/admin/page.tsx` (see selector-strategy.md)
2. Run Step 3: Setup Infrastructure
3. Generate page objects (Step 4)
4. Implement test suites (Step 5)

---

## Success Metrics

**After full implementation:**

- ✅ 100% of P0 tests passing
- ✅ 90%+ of P1 tests passing
- ✅ Tests run in under 5 minutes (parallel)
- ✅ Zero flaky tests (consistent pass/fail)
- ✅ Test suite runs on every PR
- ✅ Clear test reports with screenshots on failure

**Timeline Estimate:**
- Test IDs implementation: 2-3 hours
- Infrastructure setup: 2 hours
- Page objects: 3-4 hours
- Test implementation: 15-20 hours
- **Total: ~25-30 hours** for complete test suite

---

## Notes

**Russian Locale Considerations:**
- All UI text in Russian (Cyrillic)
- Date formatting: `d MMMM yyyy` (e.g., "15 октября 2025")
- Error messages in Russian
- Use `{ locale: ru }` from date-fns in tests

**Technology-Specific:**
- Next.js App Router: Wait for page hydration
- Zustand store: May need to access for state verification
- JWT tokens: Store in localStorage, include in API requests
- Framer Motion: Animations may cause timing issues (disable in tests)

**Parallel Execution:**
- JSON database: Use file locking or separate test files per worker
- Match IDs: Generate unique IDs with workerId
- User accounts: Separate accounts per worker or use token-based auth

---

**Ready for Step 3: Setup Infrastructure** 🚀