# Selector Strategy

> **Analysis Method:** ⚠️ CODE-BASED ANALYSIS  
> **Recommendation:** Re-verify with live Playwright MCP browser testing

---

## Decision Matrix Applied

| Score Range | Strategy | Pages |
|-------------|----------|-------|
| 80-100% | ✅ Semantic selectors only | Login (85%), Register (85%) |
| 60-79% | ⚠️ Mostly semantic + selective test IDs | Home (75%), Create/Edit Match (75%), Schedule (70%), History (70%), Match Detail (65%) |
| 0-59% | ❌ Add test IDs to all interactive elements | **Admin Panel (55%)** |

---

## Per-Page Strategies

### ✅ Page 1: Login (/login) - NO TEST IDS NEEDED

**Score:** 85/100  
**Strategy:** Pure semantic selectors

```typescript
// ✅ WORKS - Form has proper labels
await page.getByLabel('Имя пользователя').fill('admin');
await page.getByLabel('Пароль').fill('admin123');
await page.getByRole('button', { name: /Войти/ }).click();

// ✅ WORKS - Semantic link
await page.getByRole('link', { name: 'Зарегистрироваться' }).click();

// ✅ WORKS - Error message
await expect(page.getByText('Ошибка входа')).toBeVisible();
```

**No changes needed.**

---

### ✅ Page 2: Register (/register) - NO TEST IDS NEEDED

**Score:** 85/100  
**Strategy:** Pure semantic selectors

```typescript
await page.getByLabel('Имя пользователя').fill('testuser');
await page.getByLabel('Пароль').fill('password123');
await page.getByRole('button', { name: /Регистрация/ }).click();
```

**No changes needed.**

---

### ⚠️ Page 3: Home (/) - SELECTIVE TEST IDS

**Score:** 75/100  
**Strategy:** Semantic selectors + test IDs for match cards

**Semantic selectors work for:**
- ✅ Navigation links
- ✅ Statistics sections
- ✅ CTA buttons

**Test IDs needed for:**
- ❌ Specific match cards (to target by ID)
- ❌ Match card actions (view details button)

**Recommended Changes:**

```tsx
// File: components/MatchCard.tsx
export default function MatchCard({ match }: { match: Match }) {
  return (
    <article 
      data-testid={`match-card-${match.id}`}
      className="card-hover"
    >
      {/* ... existing content ... */}
      <Link 
        href={`/match/${match.id}`}
        data-testid={`match-detail-link-${match.id}`}
      >
        Подробнее
      </Link>
    </article>
  );
}
```

**Usage:**
```typescript
// ✅ Find specific match
await page.getByTestId('match-card-4');

// ✅ Click view details for match 4
await page.getByTestId('match-detail-link-4').click();
```

---

### ❌ Page 4: Admin Panel (/admin) - REQUIRES TEST IDS

**Score:** 55/100  
**Strategy:** Add test IDs to all interactive elements

**Critical Issues:**
1. ❌ Tabs without ARIA roles
2. ❌ Multiple edit/delete buttons (can't distinguish)
3. ❌ Search input without label
4. ❌ Status dropdown custom implementation

**Recommended Changes:**

#### Tab Navigation

```tsx
// File: app/admin/page.tsx (around line 130-180)

// BEFORE:
<button onClick={() => setActiveTab('matches')}>
  Матчи
</button>

// AFTER:
<button 
  role="tab"
  aria-selected={activeTab === 'matches'}
  data-testid="admin-tab-matches"
  onClick={() => setActiveTab('matches')}
>
  Матчи
</button>

<button 
  role="tab"
  aria-selected={activeTab === 'users'}
  data-testid="admin-tab-users"
  onClick={() => setActiveTab('users')}
>
  Пользователи
</button>

<button 
  role="tab"
  aria-selected={activeTab === 'settings'}
  data-testid="admin-tab-settings"
  onClick={() => setActiveTab('settings')}
>
  Настройки
</button>
```

#### Search Input

```tsx
// BEFORE:
<input 
  placeholder="Поиск..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

// AFTER:
<label htmlFor="admin-search" className="sr-only">
  Поиск матчей
</label>
<input 
  id="admin-search"
  data-testid="admin-search-input"
  placeholder="Поиск..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  aria-label="Поиск матчей"
/>
```

#### Match List Actions

```tsx
// BEFORE (around line 300-400):
{matches.map((match) => (
  <div key={match.id}>
    <span>{match.location}</span>
    <button onClick={() => router.push(`/admin/edit/${match.id}`)}>
      Редактировать
    </button>
    <button onClick={() => deleteMatch(match.id)}>
      Удалить
    </button>
  </div>
))}

// AFTER:
{matches.map((match) => (
  <div 
    key={match.id} 
    data-testid={`admin-match-row-${match.id}`}
  >
    <span data-testid={`admin-match-location-${match.id}`}>
      {match.location}
    </span>
    
    <button 
      data-testid={`admin-edit-match-${match.id}`}
      onClick={() => router.push(`/admin/edit/${match.id}`)}
      aria-label={`Редактировать матч ${match.id}`}
    >
      Редактировать
    </button>
    
    <button 
      data-testid={`admin-delete-match-${match.id}`}
      onClick={() => deleteMatch(match.id)}
      aria-label={`Удалить матч ${match.id}`}
    >
      Удалить
    </button>
    
    <select
      data-testid={`admin-status-${match.id}`}
      value={match.status}
      onChange={(e) => quickUpdateStatus(match.id, e.target.value)}
      aria-label={`Статус матча ${match.id}`}
    >
      <option value="scheduled">Запланирован</option>
      <option value="completed">Завершён</option>
    </select>
  </div>
))}
```

#### Create Match Button

```tsx
// BEFORE:
<Link href="/admin/create">
  Создать матч
</Link>

// AFTER:
<Link 
  href="/admin/create"
  data-testid="admin-create-match-btn"
>
  Создать матч
</Link>
```

**Usage After Changes:**

```typescript
// ✅ Navigate tabs
await page.getByTestId('admin-tab-matches').click();
await page.getByTestId('admin-tab-users').click();

// ✅ Search
await page.getByTestId('admin-search-input').fill('Стадион');

// ✅ Create match
await page.getByTestId('admin-create-match-btn').click();

// ✅ Edit specific match
await page.getByTestId('admin-edit-match-4').click();

// ✅ Delete specific match
await page.getByTestId('admin-delete-match-4').click();

// ✅ Change status
await page.getByTestId('admin-status-4').selectOption('completed');
```

---

### ⚠️ Page 5: Create/Edit Match - MINOR IMPROVEMENTS

**Score:** 75/100  
**Strategy:** Mostly semantic + test IDs for textarea fields

**Current selectors work:**
- ✅ `getByLabel('Дата')`
- ✅ `getByLabel('Время')`
- ✅ `getByLabel('Место')`
- ✅ `getByRole('button', {name: 'Создать матч'})`

**Add test IDs for:**
- ❌ Lineup textareas (Real Madrid vs Barcelona lineups)
- ❌ Score inputs (if completed match)

**Recommended Changes:**

```tsx
// File: app/admin/create/page.tsx & app/admin/edit/[id]/page.tsx

// Score inputs (edit page only)
<input 
  type="number"
  data-testid="score-real-input"
  aria-label="Счёт Реал Мадрид"
  value={formData.score_real}
/>

<input 
  type="number"
  data-testid="score-barca-input"
  aria-label="Счёт Барселона"
  value={formData.score_barca}
/>

// Lineup textareas
<textarea 
  data-testid="lineup-real-textarea"
  aria-label="Состав Реал Мадрид"
  value={formData.lineup_real}
  onChange={(e) => setFormData({...formData, lineup_real: e.target.value})}
/>

<textarea 
  data-testid="lineup-barca-textarea"
  aria-label="Состав Барселона"
  value={formData.lineup_barca}
  onChange={(e) => setFormData({...formData, lineup_barca: e.target.value})}
/>

// Status radio/select (edit page)
<select
  data-testid="match-status-select"
  aria-label="Статус матча"
  value={formData.status}
>
  <option value="scheduled">Запланирован</option>
  <option value="completed">Завершён</option>
</select>
```

---

## Files to Modify - Priority Order

### 🔴 CRITICAL (Blocks Admin Testing)

1. **`app/admin/page.tsx`** - Add test IDs to tabs, search, match actions
   - Lines: ~130-180 (tabs), ~200 (search), ~300-400 (match list)
   - Impact: HIGH - enables all admin panel testing

### 🟡 MEDIUM (Improves Reliability)

2. **`components/MatchCard.tsx`** - Add test IDs to match cards
   - Impact: MEDIUM - enables specific match targeting
   
3. **`app/admin/create/page.tsx`** - Add test IDs to form fields
   - Lines: ~80-150 (form inputs)
   - Impact: MEDIUM - enables create match testing

4. **`app/admin/edit/[id]/page.tsx`** - Add test IDs to form fields
   - Lines: ~100-200 (form inputs including scores)
   - Impact: MEDIUM - enables edit match testing

### 🟢 LOW (Nice to Have)

5. **`app/page.tsx`** - Add test IDs to statistics sections
   - Impact: LOW - semantic selectors mostly work

---

## Naming Convention

**Pattern:** `{page}-{element}-{type}`

**Examples:**
- `admin-tab-matches` (page: admin, element: tab, type: matches)
- `match-card-4` (element: match-card, identifier: 4)
- `admin-edit-match-4` (page: admin, action: edit, resource: match, id: 4)
- `score-real-input` (team: real, element: score, type: input)

**Consistency:**
- Use lowercase
- Separate words with hyphens
- Include resource ID when iterating (e.g., `match-${id}`)
- Be specific (not just `button-1`, but `edit-match-1`)

---

## Alternative: CSS Selectors (Not Recommended)

**If test IDs cannot be added immediately, use CSS as fallback:**

```typescript
// ⚠️ FRAGILE - Breaks if styling changes
await page.locator('.admin-match-row').nth(0);
await page.locator('button:has-text("Редактировать")').nth(2);

// Better but still fragile:
await page.locator('[href="/admin/edit/4"]');
```

**Why not recommended:**
- Breaks when Tailwind classes change
- `.nth()` unreliable in parallel tests
- Hard to maintain

---

## Implementation Timeline

### Phase 1: Admin Panel (Week 1)
- ✅ Add all test IDs to `app/admin/page.tsx`
- ✅ Verify with manual Playwright test
- ✅ Deploy to staging

### Phase 2: Match Management (Week 2)
- ✅ Add test IDs to `MatchCard` component
- ✅ Add test IDs to create/edit forms
- ✅ Update existing tests

### Phase 3: Refinement (Week 3)
- ✅ Add aria-labels where missing
- ✅ Improve tab accessibility
- ✅ Add test IDs to remaining pages if needed

---

## Verification Checklist

After implementing changes:

- [ ] All tabs use `role="tab"` and `aria-selected`
- [ ] All inputs have associated labels (via `htmlFor` or `aria-label`)
- [ ] All buttons have `aria-label` when text isn't descriptive
- [ ] All test IDs follow naming convention
- [ ] No duplicate test IDs in the DOM
- [ ] Selectors work in Playwright Inspector (Pick Locator tool)
- [ ] Tests pass with `--workers=4` (parallel execution)

---

## Summary

**Total Files to Modify:** 4  
**Total Test IDs to Add:** ~25-30  
**Estimated Implementation Time:** 2-3 hours  
**Impact:** Enables reliable, maintainable test automation

**Key Principle:**  
> Use semantic selectors first. Add test IDs only where semantic selectors fail or are unreliable.

**Next Steps:**
1. Prioritize admin panel changes (blocks most testing)
2. Implement test IDs in one PR
3. Re-run analysis with live Playwright MCP browser
4. Proceed to test plan generation
