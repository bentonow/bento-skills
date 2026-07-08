# Bento Node SDK

Use for server-side Node.js, Bun, and TypeScript applications. Never expose the Bento secret key to browser code.

## Install And Detect

Install:

```bash
npm install @bentonow/bento-node-sdk --save
bun add @bentonow/bento-node-sdk
```

Detect from project/files:

- `package.json` dependency `@bentonow/bento-node-sdk`
- imports from `@bentonow/bento-node-sdk`
- `new Analytics({ authentication, siteUuid })`

Configure once in server code:

```ts
import { Analytics } from '@bentonow/bento-node-sdk';

export const bento = new Analytics({
  authentication: {
    publishableKey: process.env.BENTO_PUBLISHABLE_KEY!,
    secretKey: process.env.BENTO_SECRET_KEY!,
  },
  siteUuid: process.env.BENTO_SITE_UUID!,
  clientOptions: { timeout: 30000 },
});
```

## Preferred Integration Recipes

Subscribers:

- Use `bento.V1.Batch.importSubscribers({ subscribers })` for sync/import flows.
- Chunk to 1-1000 subscribers per request.
- Treat import as upsert-style sync; include `email`, fields, `tags`, and `remove_tags` where needed.
- Expect async import queue behavior; newly imported subscribers may take minutes to appear.

Events:

- Use `bento.V1.Batch.importEvents({ events })` for event backfills and high-volume tracking.
- Use `bento.V1.track(...)` or `bento.V1.trackPurchase(...)` for simple single-event application paths; these delegate to batch event import.
- Use event types for behavior and automation triggers, not fields as a substitute for events.

Tags and fields:

- Use `bento.V1.Commands.addTag/removeTag/addField/removeField` for profile state changes that should not trigger automations.
- Use `bento.V1.tagSubscriber`, `updateFields`, or events when the goal is to trigger automations.

Transactional email:

- Use `bento.V1.Batch.sendTransactionalEmails({ emails })` for 1-100 emails.
- `from` must be an authorized Bento author.
- Set `transactional: true` only for true transactional mail that should bypass unsubscribe state.

Broadcasts, stats, validation:

- Use `bento.V1.Broadcasts.getBroadcasts()` and `createBroadcast([...])`.
- Use `bento.V1.Stats.getSiteStats()`, `getSegmentStats(id)`, and `getReportStats(id)`.
- Use `bento.V1.Experimental.validateEmail(...)` and `getBlacklistStatus(...)` when gating risky input.

Sequences and templates:

- Use `bento.V1.Sequences.getSequences({ page })` to list sequences and inspect the returned `id` plus embedded `email_templates`.
- Use `bento.V1.Sequences.createSequenceEmail(sequenceId, { subject, html, ... })` to append a new email to a sequence. Pass the `id` returned by `getSequences`.
- Use `bento.V1.EmailTemplates.updateEmailTemplate({ id, subject, html })` to patch an existing template by numeric template ID. This updates the current email in place; it does not add another step.
- Create requests POST to `/fetch/sequences/:id/emails/templates` with an `email_template` wrapper. Update requests PATCH `/fetch/emails/templates/:id`.
- Name-based create flows must resolve to a sequence record and use its returned `id`.

## API Guardrails

- `Commands.*` and `POST /fetch/commands` return `{ results }` (queued count), not a synchronous subscriber record.
- Import subscribers with `Batch.importSubscribers` (1-1000, no automations). Single `POST /fetch/subscribers` creates may trigger automations.
- Cache `Stats.getSiteStats` and related calls. `/stats/*` allows about 30 requests per hour per IP.
- Blacklist: `Experimental.getBlacklistStatus` uses query params `domain` and/or `ip`, not `ip_address` or `blacklist.json`.
- Geolocation is disabled; `GET /experimental/geolocation` returns `{}`.
- HTTP tag delete: `DELETE /fetch/tags/:id` with `{ tag: { name } }`. List tags first.
- Chunk batch events to 1000 items max per request.

## Use This, Not That

- Use `Batch.importSubscribers`, not `for await (user of users) addSubscriber(user)`.
- Use server-only modules or API routes, not client components with secret keys.
- Use a shared configured client, not constructing a new client for every request.
- Use command methods for tags/fields/subscription state, not raw HTTP.
- Use chunks and retries around failed chunks, not one huge in-memory import.

## Verification

```bash
bun test
bun test --coverage
bun run build
npm test
```

Mock network calls. Test chunking, max batch sizes, env config, and the exact payload shape for subscriber import, event import, and transactional email.
