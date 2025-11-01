# Project Stack

**Framework:** Next.js 14.0.4 (App Router)  
**State Management:** Zustand 4.4.7  
**UI Library:** React 18.2.0  
**Styling:** Tailwind CSS 3.4.0  
**Animations:** Framer Motion 10.16.16  
**Forms:** React Hook Form 7.49.2  
**Auth:** JWT (jsonwebtoken) + bcryptjs  
**Database:** JSON file-based (sql.js 1.10.3)  
**Date Handling:** date-fns 3.0.6  
**Build Tool:** Next.js (Turbopack in dev)  
**Language:** TypeScript 5.3.3

## Testing Implications

- **Next.js App Router:** Server Components + Client Components mixed
  - Wait for hydration before interactions on client components
  - Use `'use client'` directive detection for component type
  
- **Zustand State:** Global state management
  - Mock store state for isolated tests
  - Reset store between tests for isolation
  
- **JWT Auth:** Token-based authentication
  - Store token in localStorage/cookies
  - Mock auth state with valid JWT tokens
  - Test protected routes with authenticated sessions
  
- **JSON Database:** File-based data storage
  - Use separate test database file per worker
  - Clean/reset data between tests
  - Fast setup/teardown (no DB server needed)
  
- **Framer Motion:** Animation library
  - May need to disable animations in tests: `prefersReducedMotion: 'reduce'`
  - Wait for animation completion if testing visual states
  
- **Tailwind CSS:** Utility-first styling
  - No CSS-in-JS runtime overhead
  - Classes are static, good for snapshot testing

## Application Type

**Amateur Football Management System** - "El Clásico"
- Match scheduling and results
- Team lineups management
- Historical match data
- Admin panel for match CRUD operations
- User authentication (admin/player roles)

## Key Pages Identified (from codebase)

- `/` - Home page (matches overview, statistics)
- `/schedule` - Schedule page (upcoming matches)
- `/history` - History page (past matches)
- `/match/[id]` - Match detail page
- `/login` - Login page
- `/register` - Register page
- `/admin` - Admin panel (protected)
- `/admin/create` - Create match (protected)
- `/admin/edit/[id]` - Edit match (protected)

## API Endpoints

- `GET /api/matches` - List all matches
- `GET /api/matches/[id]` - Get match by ID
- `POST /api/matches` - Create match (admin only)
- `PATCH /api/matches/[id]` - Update match (admin only)
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

## Test Data Requirements

- Admin users (role: ADMIN)
- Player users (role: PLAYER)
- Completed matches (status: completed, with scores)
- Scheduled matches (status: scheduled, without scores)
- Team names: "Реал Мадрид", "Барселона"
