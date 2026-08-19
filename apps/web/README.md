# web

Next.js (App Router) dashboard for driftwatch.

```
pnpm install
pnpm dev
```

Runs on `http://localhost:3000`.

## Bright Data CLI

The ingestion pipeline uses [Bright Data](https://brightdata.com) Collectors
(see the root `CLAUDE.md` for the Phase 1 tracking table). This is the
onboarding reference for getting the `bdata` CLI authenticated locally.

### Install

```
npm install -g @brightdata/cli
```

Installs two equivalent commands, `brightdata` and `bdata`. Verify with:

```
bdata --version
```

### Log in

Pick whichever matches your setup — all three end up authenticated the same
way, they just differ in how you approve it:

**On a machine with a browser (the common case):**

```
bdata login
```

Opens `brightdata.com`'s auth page automatically and completes on its own
once you approve it there. If the browser doesn't open, it prints the URL to
open manually.

**Headless / SSH / remote box with no local browser:**

```
bdata login --device
```

Prints a short code and a URL (`brightdata.com/cp/device_approve`) — open
that URL and enter the code from any device that does have a browser (your
laptop, phone, etc.), while the CLI on the headless box polls in the
background until you approve it.

**Already have an API key** (e.g. the `BRIGHTDATA_API_KEY` from the root
`.env.example`):

```
bdata login --api-key "$BRIGHTDATA_API_KEY"
```

Skips the browser entirely. This also means: if `BRIGHTDATA_API_KEY` is
already set in your shell/`.env`, the CLI picks it up automatically and you
may not need to run `login` at all.

### Confirm it worked

```
bdata zones
```

Lists your account's zones on success. If you see
`Error: No API key found` instead, login didn't complete — retry one of the
steps above.

### Log out / rotate

```
bdata logout
```

Clears the stored credentials so a subsequent `bdata login` starts fresh.
