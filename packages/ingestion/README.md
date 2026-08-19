# ingestion

Standalone Hono service, deployed independently of `apps/web`.

```
pnpm install
pnpm dev
```

Runs on `http://localhost:3001` by default (override with `PORT`).

```
curl http://localhost:3001/health
# { "ok": true }
```
