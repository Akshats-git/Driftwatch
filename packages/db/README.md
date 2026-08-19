# db

Drizzle ORM wiring for the project's Postgres (Supabase) database. Schema-only
for now — no tables defined yet.

```
cp .env.example .env   # fill in DATABASE_URL
pnpm install
```

## Scripts

| Script           | What it does                                                |
| ---------------- | ----------------------------------------------------------- |
| `pnpm generate`  | Diff `src/schema.ts` against `migrations/` and write SQL    |
| `pnpm migrate`   | Apply pending migrations in `migrations/` to `DATABASE_URL` |
| `pnpm build`     | Compile to `dist/`                                          |
| `pnpm typecheck` | `tsc --noEmit`                                              |
| `pnpm lint`      | Lint against the shared root ESLint config                  |

Run these from this package (`pnpm --filter db run <script>`) — they're not
wired into the root recursive scripts, since generating/applying migrations
should be a deliberate action, not a side effect of `pnpm build`.

## Adding tables

Define tables in `src/schema.ts` and export them, then run `pnpm generate`.
The exported `db` client in `src/index.ts` already passes the full schema
module through, so new tables are typed on `db.query.*` automatically.
