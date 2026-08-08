# Cophee Production-Readiness Plan

## Goal

Transform Cophee from `create-next-app` boilerplate into a production-ready coffee shop POS system with:
1. A public-facing portfolio/ordering website (`apps/web`)
2. An admin dashboard for POS, employee management, inventory, and sales reporting (`apps/admin`), backed by PostgreSQL
3. Full production hardening: auth, authorization, testing, CI/CD, security, observability, and deployment

## Current State

Single commit (`db26c7b`). Both `cophee/` and `admin/` directories contain default `create-next-app` templates. **No product logic exists** despite the GitHub README claiming "POS system, employee and inventory management, and real-time sales reporting." GitHub remote is `AlifSrSE/Cophee` (was `VOID-ALIF/Cophee`).

## Constraints

| Constraint | Resolution |
|---|---|
| Package manager | npm (both apps have `package-lock.json`). Do not switch. |
| Node version | Node 22 (`.nvmrc`). |
| Database | PostgreSQL 16 (already in Prisma config). Local via Docker. |
| Team | Solo developer. Favor simplicity, proven tools, minimal moving parts. |
| Hosting | Web → Vercel. Admin → Docker (VPS). |
| No external SaaS accounts | Use open-source tools only (no Clerk, no Supabase). |

---

## Design Decisions (Resolved)

| # | Decision | Resolution | Rationale |
|---|---|---|---|
| 1 | Monorepo tool | **Turborepo** | First-party Vercel integration, caching, `next dev` proxying |
| 2 | API style | **REST (App Router route handlers)** | Simpler than tRPC for cross-deployment; OpenAPI via Zod |
| 3 | Admin auth | **NextAuth.js v5, Credentials provider** | Email + password for employees. Google OAuth deferred to Phase 7. |
| 4 | Password hashing | **argon2** | OWASP recommended; bcrypt deprecated |
| 5 | Session storage | **JWT inside HttpOnly cookie + Redis blocklist** | Redis enables forced logout/session revocation |
| 6 | Real-time reporting | **Polling (React Query/SWR)** | 10s polling for MVP. SSE/WebSocket deferred. |
| 7 | Web app auth | **None** | Public site. Customers identified by name + phone. |
| 8 | Admin access control | **RBAC middleware** | Roles: `owner`, `manager`, `staff` mapped to endpoint permissions |
| 9 | Shared code | **`@cophee/*` npm workspace packages** | Types, UI, API client, database, logger, configs |
| 10 | Web→Admin API auth | **No auth — public rate-limited endpoints + CORS** | Order creation/tracking are inherently public (customer submits order). API key in client code is a vulnerability. |
| 11 | Container scan | **Trivy** | Free, CI-friendly |
| 12 | Error tracking | **Sentry (free tier)** | Client + server |
| 13 | Analytics | **Plausible (self-hosted)** | Privacy-first |
| 14 | API docs | **zod-to-openapi** | OpenAPI spec generated from Zod schemas |
| 15 | Image storage | **MinIO (local) / S3 (prod)** | S3-compatible, runs in Docker |
| 16 | Background jobs | **BullMQ + Redis** | Low-stock alerts, report generation |

### Why not an API key for web→admin?

An API key embedded in client-side JavaScript is **public by definition**. Any visitor can extract it via DevTools and abuse the endpoint. Instead:
- Public endpoints (`/api/v1/menu`, `/api/v1/orders`, `/api/v1/orders/[id]/status`) require **no auth** but enforce **IP-based rate limiting**.
- CORS restricts allowed origins to `NEXT_PUBLIC_WEB_URL`.
- No sensitive data is returned on public endpoints.

## Term Definitions

- **Employee**: Coffee shop worker. Has email + password. Assigned a `Role`. Can log into the admin dashboard.
- **Customer**: Coffee shop patron using the public web app. Unregistered. Identified by `name` + `phone` at order placement.
- **Role**: Permission set. `owner` (full access), `manager` (POS + reports), `staff` (orders + inventory).
- **Order**: Customer's request for products. Has `source` (`dine_in`, `online`, `takeaway`), `tableId` (nullable), line items, status, payment info.
- **Order Status**: `pending` → `preparing` → `ready` → `completed`. Or `cancelled`.
- **Session**: Authenticated period for an Employee. JWT in HttpOnly cookie. Redis used for revocation/blocklist.
- **InventoryItem**: Raw ingredient. Decremented when products are ordered (via product→ingredient mapping).
- **Product**: Menu item. References `InventoryItem`s as ingredients. Has `price`, `categoryId`, `imageKey`.

---

## Data Flow

### Web App → Admin API (Place Online Order)

```
Customer (web browser at cophee.com)
  │  POST https://admin.cophee.com/api/v1/orders
  │  CORS: Origin: https://cophee.com
  │  body: { customerName, phone, source: "online", items: [{productId, qty}] }
  ▼
Admin App API Route Handler (/api/v1/orders/route.ts)
  │  1. Zod validate request body
  │  2. Rate limit (60 req/min per IP, lru-cache)
  │  3. CORS check: origin in allowlist
  │  4. Prisma transaction ($transaction):
  │     a. Create Order (status=pending, source=online, tableId=null)
  │     b. Create OrderItems (snapshot unitPrice)
  │     c. For each item: decrement InventoryItem quantities
  │     d. If any inventory < 0: ROLLBACK (throw INSUFFICIENT_INVENTORY)
  │     e. Create AuditLog entry
  │  5. Return { success: true, data: { orderId, orderNumber } }
  ▼
Prisma Client (singleton)
  │  PostgreSQL transaction (FOR UPDATE on inventory rows)
  ▼
PostgreSQL
```

### Admin (Authenticated) → API (View Sales Report)

```
Manager (browser at admin.cophee.com, session cookie attached)
  │  GET /api/v1/reports/sales?from=2025-01-01&to=2025-01-31
  │  Cookie: next-auth.session-token=<JWT>
  ▼
API Route Handler (/api/v1/reports/sales/route.ts)
  │  1. Zod validate query params
  │  2. RBAC check: session.role ∈ ['owner', 'manager']
  │  3. Rate limit (120 req/min authenticated)
  │  4. Prisma aggregation: revenue, orders, top items by date range
  │  5. Return { success: true, data: {...}, meta: { period } }
  ▼
Prisma Client
  │  PostgreSQL read
  ▼
PostgreSQL
```

### Auth Flow (Employee Login)

```
Employee (browser at admin.cophee.com)
  │  POST /api/auth/signin (NextAuth.js Credentials provider)
  │  body: { email, password, redirect: false }
  ▼
NextAuth.js Credentials Callback
  │  1. Zod validate { email, password }
  │  2. Prisma: find User by email (include Employee, Role)
  │  3. argon2.verify(password, user.passwordHash)
  │  4. Check employee.isActive === true
  │  5. If fail: return null → NextAuth.js returns 401
  │  6. Build JWT payload: { sub: userId, role: role.name, permissions: [...] }
  │  7. Return payload → NextAuth.js issues HttpOnly cookie
  ▼
PostgreSQL
```

---

## Environment Variables

### Root (shared)
```
DATABASE_URL          # PostgreSQL connection string
REDIS_URL             # Redis connection (sessions, rate limiting, queues)
```

### apps/admin/.env
```
NEXTAUTH_SECRET       # Random secret for JWT signing
NEXTAUTH_URL          # https://admin.cophee.com
NEXT_PUBLIC_APP_URL   # Same as above (for internal links)
ADMIN_CORS_ORIGINS    # comma-separated allowed origins for web app
```

### apps/web/.env
```
NEXT_PUBLIC_ADMIN_API_URL  # https://admin.cophee.com/api/v1
NEXT_PUBLIC_APP_URL        # https://cophee.com
```

### packages/database
```
DATABASE_URL          # Injected from root .env
```

---

## Migration Path (Monorepo Conversion)

The repo root IS the monorepo root. Current structure: `cophee/` and `admin/` at root level.

1. Create root `package.json` with `"workspaces": ["apps/*", "packages/*"]`, `"type": "module"`, and Turborepo as devDependency.
2. Create root `turbo.json` with pipeline: `dev`, `build`, `lint`, `test`, `typecheck`, `db:push`, `db:seed`.
3. Create root `.gitignore` (consolidate from both apps; remove per-app `.gitignore` after migration).
4. Create root `docker-compose.yml` (PostgreSQL 16, Redis 7, Adminer, MinIO).
5. Create root `.nvmrc` (`22`).
6. Create root `.npmrc` (set `package-lock=true`, `audit=false` for dev).
7. Move `cophee/` → `apps/web/`.
8. Move `admin/` → `apps/admin/`.
9. Create `packages/{configs,logger,database,types,ui,api-client}`.
10. Each package gets `package.json` with `name: "@cophee/*"` and proper `exports` field.
11. Delete `node_modules` + `package-lock.json` from old app dirs.
12. Run `npm install` at root.
13. Update import paths: `@/lib/utils` → `@cophee/ui`, `@/lib/logger` → `@cophee/logger`, etc.
14. Configure `packages/configs/typescript` with `base.json` + app-specific overwrites.
15. Configure `packages/configs/eslint` and `packages/configs/prettier`.
16. Verify: `npx turbo run typecheck --force` passes for all packages and apps.

**Rollback**: Git tracks the original commit. If broken, revert and use `file:` protocol in package.json instead of workspace linking.

---

## Failure Modes

| Failure | Impact | Detection | Recovery |
|---|---|---|---|
| PostgreSQL down | All writes fail; API returns 503 | `/api/v1/health` returns 503 | Docker restart |
| Redis down | Auth fails; rate limiting disabled | Health check; NextAuth.js errors | Docker restart; dev fallback: in-memory store |
| Prisma connection leak | App crashes under load | Pool exhaustion in logs | Singleton client; `$disconnect()` on SIGTERM |
| Migration failure | New deploy breaks | CI migration step fails | `prisma migrate resolve`; blue-green deploy mitigates |
| Inventory race condition | Negative stock; over-sell | DB constraint violation | `$transaction` with `SELECT FOR UPDATE` on inventory rows |
| Out of stock during ordering | Order fails mid-transaction | `INSUFFICIENT_INVENTORY` error code | Transaction rollback; web app shows error to customer |
| Concurrent orders (double-click) | Duplicate orders | Duplicate detection in logs | Idempotency key header on POST `/api/orders` |
| Large report query | 504 timeout | Response time > 30s | Paginate report results; background job for exports |
| Token expiry mid-request | 401 on valid session | Sentry error report | NextAuth.js silent refresh; redirect on 401 |
| CORS misconfiguration | Web app can't call API | Browser CORS error in console | Correct `ADMIN_CORS_ORIGINS`; test in CI |
| E2E test flakiness | CI false failure | Flaky test annotation | Playwright retries=2; isolated test DB |
| Image upload overflow | Disk filled | Storage usage alerts | MinIO retention policy; max file size limit |

---

## Implementation Task List

### Phase 0: Monorepo & Infrastructure
- [ ] Root `package.json` (Turborepo, npm workspaces)
- [ ] `turbo.json` pipeline (dev, build, lint, test, typecheck, db:*)
- [ ] Root `.gitignore`, `.nvmrc`, `.npmrc`
- [ ] `docker-compose.yml` (PostgreSQL 16, Redis 7, Adminer, MinIO)
- [ ] Root multi-stage `Dockerfile` (builds and runs admin app)
- [ ] Move `cophee/` → `apps/web/`, `admin/` → `apps/admin/`
- [ ] Create `packages/configs/` (typescript base + app overrides, eslint flat config, prettier config)
- [ ] Create `packages/logger/` (Pino with env-aware config)
- [ ] Create `packages/database/` (Prisma schema, client singleton, migrations, seed script)
- [ ] Create `packages/types/` (shared Zod schemas + TypeScript types)
- [ ] Create `packages/ui/` (shadcn/ui component library)
- [ ] Create `packages/api-client/` (typed fetch client with error handling)
- [ ] `npm install` at root; verify all packages resolve

### Phase 1: Data Layer & API Foundation
- [ ] Prisma schema: `Role`, `User`, `Employee`, `Category`, `Product`, `ProductIngredient`, `InventoryItem`, `Table`, `Order`, `OrderItem`, `AuditLog`
- [ ] Prisma client singleton with graceful shutdown (`SIGTERM` handler)
- [ ] Seed script with sample coffee shop data (categories, products, inventory, employees)
- [ ] API response envelope: `ApiResponse<T> = { success: boolean; data?: T; error?: { message: string; code: string }; meta?: Record<string, unknown> }`
- [ ] `GET /api/v1/health` — checks DB + Redis connectivity, returns status
- [ ] `GET /api/v1/menu` — public endpoint, returns categories + products (no pricing on web)
- [ ] CORS middleware for public endpoints (origins from env var)
- [ ] Rate limiting middleware (lru-cache: 60/min unauthed, 120/min authed)
- [ ] Run `prisma migrate dev --name init`

### Phase 2: Auth & Authorization
- [ ] NextAuth.js v5 config: Credentials provider (email + password)
- [ ] argon2 integration for password verification
- [ ] Redis store for session revocation (blocklist on logout)
- [ ] RBAC middleware: `middleware.ts` that checks session role against route patterns
- [ ] Login page (`apps/admin/app/login/page.tsx`)
- [ ] Protected admin layout with session provider
- [ ] Logout endpoint that adds token to Redis blocklist

### Phase 3: Admin Dashboard (Core CRUD)
- [ ] Dashboard layout: sidebar nav (Employees, Products, Inventory, Orders, Tables, Reports, Audit)
- [ ] Employee management: list, create, edit, deactivate (Owner only)
- [ ] Product/Category management: CRUD with image upload (MinIO → S3)
- [ ] Inventory management: CRUD, low-stock threshold, auto-alert via BullMQ
- [ ] Table management: status (available, occupied, cleaning)
- [ ] POS order flow: select table → add products → payment method → submit (transaction-safe)
- [ ] Order detail page: status update buttons, notes
- [ ] Audit log viewer (Owner only, filterable by entity + date)

### Phase 4: Public Web App
- [ ] Landing page: hero, about, contact
- [ ] Menu page: categories + products (via `@cophee/api-client` calling admin API)
- [ ] Online ordering: product selection → cart → checkout (name + phone → POST order)
- [ ] Order tracking: customer enters phone → sees order status (poll every 10s)
- [ ] Error boundaries on all pages
- [ ] Custom favicon for both apps
- [ ] Accessibility: ARIA labels, semantic HTML, keyboard nav

### Phase 5: Testing
- [ ] Vitest + React Testing Library: unit tests for utils, Zod schemas, API client, auth logic
- [ ] Prisma test fixtures (test database, transaction rollback per test)
- [ ] Playwright: E2E for auth, order flow (dine-in + online), inventory update, reporting
- [ ] Coverage: ≥80% branches/functions/lines/statements
- [ ] Test failure scenarios: race condition, out-of-stock, token expiry, rate limiting

### Phase 6: CI/CD & Security Hardening
- [ ] GitHub Actions: `lint.yml` (ESLint + Prettier + tsc, max-warnings 0)
- [ ] GitHub Actions: `test.yml` (Vitest + coverage threshold + Playwright)
- [ ] GitHub Actions: `security.yml` (npm audit, gitleaks, Trivy container scan)
- [ ] GitHub Actions: `deploy.yml` (Vercel preview for web; Docker build for admin)
- [ ] Security headers in `next.config.ts`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] Zod validation on every API route handler
- [ ] OpenAPI spec generation via `zod-to-openapi` (generated to `docs/openapi.json`)
- [ ] Husky + lint-staged: pre-commit runs lint + format on staged files
- [ ] Commitlint: enforce conventional commits
- [ ] `dependabot.yml`: daily dependency updates
- [ ] `.github/ISSUE_TEMPLATE/`: bug report, feature request

### Phase 7: Observability & Production Hardening
- [ ] Structured Pino logging in all API route handlers (request ID, user, action)
- [ ] Client + server Sentry integration
- [ ] Plausible analytics script on both apps
- [ ] `@next/bundle-analyzer` — fail CI if JS bundle > 500KB
- [ ] `next/image` remote patterns for MinIO/S3
- [ ] Server action error boundaries
- [ ] Health check with dependency status (DB, Redis)

### Phase 8: Documentation
- [ ] Root `README.md`: architecture diagram, local setup, env var reference
- [ ] `apps/web/README.md` and `apps/admin/README.md`
- [ ] ADR-001: Monorepo tool (Turborepo)
- [ ] ADR-002: API style (REST + Zod)
- [ ] ADR-003: Auth strategy (NextAuth.js Credentials + Redis)
- [ ] API docs served at `/docs` (Redoc/Spectacle from OpenAPI spec)
- [ ] CONTRIBUTING.md
- [ ] `.github/ISSUE_TEMPLATE/` (bug report, feature request)

---

## Validation Criteria

| Check | Pass criteria | Enforced by |
|---|---|---|
| Type safety | `tsc --noEmit` exits 0 across all packages + apps | GitHub Actions |
| Lint | `eslint . --max-warnings 0` passes | GitHub Actions + pre-commit |
| Formatting | `prettier --check .` exits 0 | GitHub Actions + pre-commit |
| Unit tests | ≥80% coverage; all pass | Vitest in CI |
| E2E tests | All Playwright tests pass (3 retries) | GitHub Actions |
| Security audit | 0 high/critical npm vulns; no secret leaks | npm audit + gitleaks + Trivy |
| Build | Both apps `next build` without errors | GitHub Actions |
| Health check | `/api/v1/health` returns 200 with DB+Redis OK | CI health check step |
| API spec | OpenAPI JSON is valid and matches Zod schemas | zod-to-openapi in CI |
| Bundle size | < 500KB initial JS per app | @next/bundle-analyzer in CI |
| Rate limiting | 61st request in 1 min returns 429 | Playwright E2E test |
| RBAC | Staff role cannot access `/api/v1/reports` | Playwright E2E test |
| CORS | Cross-origin from disallowed domain is blocked | curl + Playwright test |

---

## Out of Scope

- Mobile app (React Native / Expo)
- WebSocket-based real-time order updates (SSE deferred to post-MVP)
- Multi-location support
- Advanced analytics (ML forecasting)
- Payment processor integration (Stripe) — MVP records payment method only
- Customer registration/accounts — phone number only
- Google OAuth for admin auth — Credentials provider only for MVP

---

*Generated from analysis of Cophee repo at commit `db26c7b`. Remote: `AlifSrSE/Cophee`.*
