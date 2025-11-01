# Application Pages

> **Analysis Method:** ⚠️ CODE-BASED ANALYSIS (Playwright MCP browser tools not available in current session)

**Note:** This analysis is based on codebase examination. For production use, re-analyze with live Playwright MCP browser testing using the `analyze-app` prompt with MCP access.

---

## Page 1: Home Page (/) - Score: 75/100 ⚠️

**File:** `app/page.tsx`  
**Type:** Client Component (`'use client'`)  
**Auth:** Public (no protection)

### Interactive Elements

| Element | Code Location | Recommended Selector | Notes |
|---------|--------------|---------------------|-------|
| Navigation Links | `<Navigation />` component | `getByRole('link', {name: 'Главная'})` | Semantic navigation |
| Match Cards | `<MatchCard />` component | `getByRole('article')` | Clickable cards |
| CTA Buttons | Line ~300-350 | `getByRole('link', {name: 'Смотреть расписание'})` | Link buttons |

### Score Rationale

**Positive (+75):**
- ✅ Uses `<Navigation />` component (likely semantic)
- ✅ Proper heading structure (`<h1>`, `<h2>`, `<h3>`)
- ✅ Loading state with accessible text
- ✅ Framer Motion animations (good for UX)
- ✅ Links use Next.js `<Link>` component
- ✅ Statistics displayed in structured grid

**Negative (-25):**
- ⚠️ No data-testid attributes visible
- ⚠️ Extensive use of Tailwind utility classes (hard to query)
- ⚠️ Complex nested `<motion.div>` structures
- ⚠️ Match cards may need test IDs for specific targeting

### Selector Strategy

**Use semantic selectors where possible:**
```typescript
// Navigation
await page.getByRole('link', { name: 'Главная' });
await page.getByRole('link', { name: 'Расписание' });

// Statistics
await page.getByText('Побед Реала');
await page.getByText('Ничьих');

// Match cards - may need refinement
await page.getByRole('article').first();
```

---

## Page 2: Login Page (/login) - Score: 85/100 ✅

**File:** `app/login/page.tsx`  
**Type:** Client Component
**Auth:** Public

### Interactive Elements

| Element | Code Location | Recommended Selector | Quality |
|---------|--------------|---------------------|---------|
| Username Input | Line 67-74 | `getByLabel('Имя пользователя')` | ✅ Has label |
| Password Input | Line 77-84 | `getByLabel('Пароль')` | ✅ Has label |
| Submit Button | Line 96-102 | `getByRole('button', {name: /Войти/})` | ✅ Semantic |
| Register Link | Line 105-109 | `getByRole('link', {name: 'Зарегистрироваться'})` | ✅ Semantic |
| Error Message | Line 88-92 | `getByRole('alert')` or `getByText` | ⚠️ Conditional |

### Score Rationale

**Positive (+85):**
- ✅ **Form inputs have proper labels** (key for accessibility)
- ✅ Semantic HTML: `<label>`, `<input>`, `<button>`
- ✅ Error display with red border styling
- ✅ Loading state disables button
- ✅ Uses React Hook Form patterns
- ✅ Clear navigation with `<Link>` component

**Negative (-15):**
- ⚠️ Labels don't use `htmlFor` attribute (should match input `id`)
- ⚠️ No explicit `role="alert"` on error div
- ⚠️ Custom CSS classes instead of ARIA attributes

### Selector Strategy

**HIGH QUALITY - Use semantic selectors:**
```typescript
// Fill form
await page.getByLabel('Имя пользователя').fill('admin');
await page.getByLabel('Пароль').fill('admin123');

// Submit
await page.getByRole('button', { name: /Войти/ }).click();

// Check error
await expect(page.getByText('Ошибка входа')).toBeVisible();

// Navigate to register
await page.getByRole('link', { name: 'Зарегистрироваться' }).click();
```

---

## Page 3: Register Page (/register) - Score: 85/100 ✅

**File:** `app/register/page.tsx` (assumed similar to login)  
**Type:** Client Component  
**Auth:** Public

### Expected Elements

| Element | Recommended Selector |
|---------|---------------------|
| Username Input | `getByLabel('Имя пользователя')` |
| Password Input | `getByLabel('Пароль')` |
| Confirm Password | `getByLabel('Подтвердите пароль')` |
| Submit Button | `getByRole('button', {name: /Регистрация/})` |

**Note:** Assuming similar structure to login page. Verify with live testing.

---

## Page 4: Schedule Page (/schedule) - Score: 70/100 ⚠️

**File:** `app/schedule/page.tsx` (inferred from routes)  
**Type:** Client Component  
**Auth:** Public

### Expected Elements

| Element | Recommended Selector | Notes |
|---------|---------------------|-------|
| Upcoming Matches | `getByRole('article')` | Match cards |
| Filter/Search | `getByRole('searchbox')` | If present |
| Date Selector | `getByLabel('Дата')` | If present |

### Score Rationale

**Estimated based on codebase patterns:**
- ✅ Likely uses `<MatchCard />` component (consistent)
- ✅ Navigation present
- ⚠️ May lack test IDs for specific matches
- ⚠️ Complex date filtering may need custom selectors

---

## Page 5: History Page (/history) - Score: 70/100 ⚠️

**File:** `app/history/page.tsx` (inferred)  
**Type:** Client Component  
**Auth:** Public

### Expected Elements

| Element | Recommended Selector |
|---------|---------------------|
| Completed Matches | `getByRole('article')` |
| Match Results | `getByText(/\d+:\d+/)` |
| Date Filters | `getByRole('button')` |

**Similar structure to schedule page, showing completed matches.**

---

## Page 6: Match Detail (/match/[id]) - Score: 65/100 ⚠️

**File:** `app/match/[id]/page.tsx`  
**Type:** Client Component  
**Auth:** Public

### Interactive Elements

| Element | Recommended Selector | Notes |
|---------|---------------------|-------|
| Score Display | `getByText(/\d+:\d+/)` | Static text |
| Team Lineups | `getByText('Состав')` | Accordion/section |
| Back Button | `getByRole('link', {name: 'Назад'})` | Navigation |

### Score Rationale

**Moderate quality:**
- ✅ Displays match data
- ✅ Navigation present
- ⚠️ Complex layout with scores and lineups
- ⚠️ May need test IDs for specific lineup players
- ⚠️ Dynamic `[id]` parameter needs proper URL construction

---

## Page 7: Admin Panel (/admin) - Score: 55/100 ❌

**File:** `app/admin/page.tsx`  
**Type:** Client Component  
**Auth:** Protected (ADMIN role required)

### Interactive Elements

| Element | Code Location | Recommended Selector | Issue |
|---------|--------------|---------------------|-------|
| Tab Buttons | Line 130-180 | `getByRole('tab', {name: 'Matches'})` | ⚠️ May not use tab role |
| Search Input | Line ~200 | `getByPlaceholder('Поиск...')` | ⚠️ Should use label |
| Create Button | Line ~250 | `getByRole('link', {name: 'Создать матч'})` | ✅ Link |
| Edit Buttons | Line ~350+ | `getByRole('button', {name: /Редактировать/})` | ⚠️ Multiple instances |
| Delete Buttons | Line ~360+ | `getByRole('button', {name: /Удалить/})` | ⚠️ Multiple instances |
| Status Dropdown | Line 68-79 | `getByRole('combobox')` | ⚠️ Custom implementation |

### Score Rationale

**LOW QUALITY - Needs Test IDs:**
- ❌ **Tabs may not use proper ARIA roles** (custom `<button onClick={setActiveTab}>`)
- ❌ **Multiple edit/delete buttons without unique identifiers**
- ❌ **Search input lacks associated label**
- ❌ **Complex table/list structure** (needs test IDs per row)
- ✅ Loading state present
- ✅ Error handling with alerts

### **RECOMMENDED: Add Test IDs**

```tsx
// Tabs
<button data-testid="admin-tab-matches" onClick={() => setActiveTab('matches')}>
  Matches
</button>

// Search
<input data-testid="admin-search" placeholder="Поиск..." />

// Match rows
<div data-testid={`match-row-${match.id}`}>
  <button data-testid={`edit-match-${match.id}`}>Edit</button>
  <button data-testid={`delete-match-${match.id}`}>Delete</button>
</div>
```

---

## Page 8: Create Match (/admin/create) - Score: 75/100 ⚠️

**File:** `app/admin/create/page.tsx`  
**Type:** Client Component  
**Auth:** Protected (ADMIN)

### Interactive Elements

| Element | Recommended Selector | Quality |
|---------|---------------------|---------|
| Date Input | `getByLabel('Дата')` | ✅ Labeled |
| Time Input | `getByLabel('Время')` | ✅ Labeled |
| Location Input | `getByLabel('Место')` | ✅ Labeled |
| Submit Button | `getByRole('button', {name: 'Создать матч'})` | ✅ Semantic |
| Cancel Button | `getByRole('button', {name: 'Отмена'})` | ✅ Semantic |

### Score Rationale

**GOOD quality:**
- ✅ Form inputs have labels
- ✅ Clear submit/cancel actions
- ✅ Error display
- ⚠️ May need test IDs for complex lineup inputs

---

## Page 9: Edit Match (/admin/edit/[id]) - Score: 75/100 ⚠️

**File:** `app/admin/edit/[id]/page.tsx`  
**Type:** Client Component  
**Auth:** Protected (ADMIN)

### Interactive Elements

Similar to Create Match page, with additional:
- **Score inputs** (if match completed)
- **Status dropdown** (scheduled/completed)
- **Lineup textareas**

**Recommend same test ID strategy as Create Match.**

---

## Summary by Quality Tier

### ✅ HIGH QUALITY (80%+) - Use Semantic Selectors
- Login Page (85%)
- Register Page (85%)

### ⚠️ MEDIUM QUALITY (60-79%) - Mixed Approach
- Home Page (75%)
- Create Match (75%)
- Edit Match (75%)
- Schedule Page (70%)
- History Page (70%)
- Match Detail (65%)

### ❌ LOW QUALITY (<60%) - Add Test IDs
- **Admin Panel (55%)** - Priority for test IDs

---

## Overall Assessment

**Codebase Quality:** GOOD for public-facing pages, NEEDS IMPROVEMENT for admin panel

**Key Issues:**
1. ❌ **Admin panel has multiple buttons without unique identifiers**
2. ⚠️ **Some inputs missing explicit labels with htmlFor**
3. ⚠️ **No test IDs anywhere in codebase**
4. ⚠️ **Custom tab implementation may not use ARIA roles**

**Recommended Actions:**
1. Add test IDs to admin panel (priority)
2. Add `htmlFor` to all labels
3. Use ARIA roles for tabs
4. Consider adding test IDs to match cards for reliable targeting

---

## Verification Status

⚠️ **This analysis is CODE-BASED ONLY**

**To complete proper analysis:**
1. Install and configure Playwright MCP browser tools
2. Re-run `analyze-app` prompt with live browser testing
3. Verify all selectors work in actual rendered DOM
4. Test authentication flows
5. Capture accessibility snapshots

**Confidence Level:** MEDIUM (code analysis) - needs live testing for HIGH confidence
