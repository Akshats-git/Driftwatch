# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Driftwatch is a pnpm monorepo. The shape so far: `packages/ingestion` collects
data (Bright Data-powered scraping — see the Bright Data section below),
`packages/db` persists it in Postgres, and `apps/web` is the dashboard.
Alerting is wired for Slack/Discord (`.env.example`), and Anthropic is
available for AI-assisted analysis. Deploy targets are split: `apps/web` to
Vercel, `packages/ingestion` to Fly.io, independently of each other.

## Monorepo layout

| Path                 | What it is                                                                                   | Status                                           |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/web`           | Next.js 16 (App Router) dashboard. TypeScript strict, Tailwind CSS v4, shadcn/ui.            | Placeholder home page only.                      |
| `packages/ingestion` | Standalone Hono service on Node (`@hono/node-server`), deployed independently of `apps/web`. | `GET /health` only.                              |
| `packages/db`        | Drizzle ORM wired to Postgres (Supabase).                                                    | Wiring only — `src/schema.ts` has no tables yet. |
| `packages/cli`       | —                                                                                            | Empty, not started.                              |
| `packages/config`    | —                                                                                            | Empty, not started.                              |

Each package's own `README.md` has package-specific run instructions; this
file is about decisions and structure that span the whole repo.

`packages/ingestion` runs on port 3001 (`PORT` env var to override) and
`apps/web` on 3000 — deliberately different, since `pnpm dev` at the root
runs every package's dev script concurrently (`pnpm -r run dev`) and they'd
otherwise collide.

## Commands

Run from the repo root, these fan out to every package via `pnpm -r`:

```
pnpm install              # workspace-wide install
pnpm dev                  # runs every package's dev script concurrently
pnpm build
pnpm lint                 # NOT recursive — single shared config, see below
pnpm typecheck
pnpm test                 # no test runner exists yet; --if-present makes this a clean no-op
pnpm format / format:check
```

To scope a command to one package: `pnpm --filter <name> run <script>` (package
names are the bare `name` field in each `package.json` — `web`, `ingestion`,
`db` — not directory paths).

`packages/db`'s `generate`/`migrate` scripts are intentionally **not** wired
into the root recursive scripts — running migrations should be a deliberate,
explicit action, not a side effect of `pnpm build`. Run them with
`pnpm --filter db run generate` / `migrate`.

There is no test runner set up in any package yet (nothing to point at for
"run a single test" — add this section once one exists).

## Tech stack & architecture decisions

**One shared root config, not per-package configs.** `eslint.config.mjs` and
`tsconfig.base.json` at the repo root are the source of truth for every
package; this was a deliberate choice over letting each package's scaffolding
tool (`create-next-app`, `create-hono`) keep its own. Concretely:

- Every package's `tsconfig.json` does `extends: "../../tsconfig.base.json"`
  (strict mode plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noUnusedLocals`/`noUnusedParameters`, `verbatimModuleSyntax`). Packages
  that actually run under `node` (`packages/ingestion`, `packages/db`) must
  re-declare `"moduleResolution": "NodeNext"` themselves — the base sets
  `"Bundler"` (correct for `apps/web`, which Next.js bundles), and extending
  it without overriding silently inherits the wrong resolution mode for
  anything meant to run directly under Node.
- `eslint.config.mjs` runs type-checked linting (`typescript-eslint`'s
  `recommendedTypeChecked` + `projectService`) across the whole repo from one
  file. Framework-specific rules (`eslint-config-next`) are imported and
  scoped to `apps/web/**` via a `scopeToApp()` helper in that file, rather
  than `apps/web` owning a separate config — so a new package that needs its
  own framework lint rules should extend that helper rather than add its own
  `eslint.config.mjs`. A root-level tool-config file that intentionally sits
  outside its package's `src/` (e.g. `packages/db/drizzle.config.ts`) needs
  its path added to `parserOptions.projectService.allowDefaultProject` in
  `eslint.config.mjs`, or the linter can't find a project for it.
- Formatting is Prettier, kept separate from linting (`eslint-config-prettier`
  disables stylistic ESLint rules rather than running Prettier as a lint
  rule).

**`apps/web`**: Next.js 16 App Router, Tailwind v4 (CSS-first — no
`tailwind.config.js`, theme lives in `app/globals.css`), shadcn/ui
initialized with defaults (preset `base-nova`, which scaffolds on **Base UI**
`@base-ui/react`, not Radix).

**`packages/ingestion`**: Hono, run via `@hono/node-server` — plain Node, not
an edge/serverless runtime, chosen so it can be deployed independently to
Fly.io per the env vars.

**`packages/db`**: Drizzle ORM + `postgres` (postgres.js driver) against
Supabase. `DATABASE_URL` is a single env var used for both the runtime client
(`src/index.ts`) and `drizzle-kit` (`drizzle.config.ts`) — use Supabase's
_direct_ connection string (port 5432), not the pooled/pgbouncer one;
`drizzle-kit migrate` needs a non-pooled connection. `drizzle.config.ts` sets
`entities.roles.provider: "supabase"` so `drizzle-kit generate` doesn't treat
Supabase's system-managed Postgres roles (`anon`, `authenticated`,
`service_role`, ...) as schema drift.

**CI** (`.github/workflows/ci.yml`): one job matrixed over
`[typecheck, lint, test]`, runs on every push and pull request. Node 24
(current Active LTS — Node 20 is end-of-life as of 2026-04-30, even though
`engines.node` here still says `>=20`; worth revisiting).

**Environment variables**: see root `.env.example` for the full list with
what each one is for and where to get it — don't duplicate that list here,
it'll drift. `packages/db` also has its own scoped `.env.example` for working
in that package alone.

## A note on package versions

This repo's dependencies were installed well after most training data was
generated (Next.js 16, Tailwind v4, TypeScript 7 available but intentionally
_not_ used — see below, shadcn on Base UI, etc.). Conventions have materially
changed in places — e.g. `apps/web/AGENTS.md` documents that Next's own file
conventions differ from what older training data would expect, and points at
`node_modules/next/dist/docs/` as ground truth. Before writing
framework-specific code, prefer checking the actually-installed package's
docs/types over assumption. Similarly for GitHub Actions: check the action's
actual latest release (`gh api repos/<owner>/<repo>/releases/latest`) before
pinning a version rather than assuming.

Relatedly: TypeScript is deliberately pinned to `^5.9`, not the newer `7.x`
that `pnpm add typescript` would resolve to by default — `typescript-eslint`
and `eslint-config-next`'s plugin chain don't support TS7 yet. Same reasoning
kept root ESLint on `^9` rather than `10`. Re-check these pins before
bumping either package.

## Bright Data Collectors (Phase 1 — not started yet)

`packages/ingestion` will drive Bright Data Collectors to scrape each vendor
being watched. None are configured yet — no vendors, targets, or Collector
IDs exist in this repo currently. This table is the scaffold to fill in
during Phase 1, one row per vendor/target:

| Vendor | Collector ID | Target(s) watched | Notes |
| ------ | ------------ | ----------------- | ----- |
| _TBD_  | _TBD_        | _TBD_             | _TBD_ |

Collector IDs come from the Bright Data dashboard (Web Scrapers → the
collector → API). The API key itself goes in `.env` (`BRIGHTDATA_API_KEY`,
see `.env.example`) — never here.
