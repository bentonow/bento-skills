# Bento CLI

Use for terminal automation, CI jobs, one-off data work, and safe bulk operations against Bento. The CLI is the best choice when the project does not need an SDK integration or when data already exists as CSV/JSON.

## Install And Detect

Install/run:

```bash
npx @bentonow/bento-cli --help
npm install -g @bentonow/bento-cli
bun install -g @bentonow/bento-cli
```

Detect from project/files:

- `package.json` name `@bentonow/bento-cli`
- `bento` binary usage in scripts
- commands like `bento subscribers import`, `bento events track`, or `bento auth login`

Authenticate with a named profile for non-production environments:

```bash
bento auth login
bento profile add staging
bento profile use staging
bento auth status
```

Use `BENTO_CONFIG_PATH`, `BENTO_API_BASE_URL`, `BENTO_AUTO_CONFIRM`, and `DEBUG=bento` only when a script needs explicit behavior.

## Preferred Integration Recipes

Subscribers:

- Use `bento subscribers import contacts.csv --dry-run` to preview bulk subscriber syncs.
- Use `bento subscribers import contacts.csv --limit 10` before full runs.
- Use `bento subscribers import contacts.csv --confirm --json` in CI after validation.
- Treat CSV import as upsert-style audience sync: include `email`, known profile fields, `tags`, and `remove_tags`.

Events:

- Use `bento events track --email ... --event ... --details ...` for single event tracking.
- For bulk event backfills or purchase-specific modeling, use the selected SDK's batch event API until the CLI exposes a dedicated command.
- Pass purchase details as structured JSON in `--details` only when a one-off CLI event is the right fit.

Tags and fields:

- Use `bento subscribers tag --file users.csv --add tag --confirm` for bulk tag changes.
- Use `bento fields list` and `bento fields create <key>` to inspect or create custom field definitions.
- Use SDK subscriber command APIs for bulk field value changes; the CLI currently exposes subscriber tag, subscribe, and unsubscribe flows, not subscriber field value updates.

Broadcasts and content:

- Use `bento broadcasts list --json` for automation.
- Use `bento broadcasts create --name ... --subject ... --content ...` to create a draft broadcast, then review and send it from the Bento dashboard.
- Before creating broadcasts, require explicit include/exclude tags and a sensible `--batch-size`.
- Use `bento sequences create-email --html-file <path>` to append a new email to a sequence. This adds another step; it does not replace an existing email.
- Use `bento sequences update-email --template-id <id> --html-file <path>` to patch an existing sequence email template in place.
- Resolve the sequence ID with `bento sequences list --json` and pass the returned `id` to `--sequence-id`. You can also pass `--sequence-name "Welcome Flow"` for an exact case-insensitive name match.

## API Guardrails

- No `bento subscribers upsert` command. Use `bento subscribers import` for bulk sync and tag/field/subscribe commands for one-off changes.
- `POST /fetch/commands` (SDK command helpers) returns `{ results }` and runs async. Do not expect an immediate subscriber payload.
- Batch imports: up to 1000 subscribers or events per HTTP request. Chunk larger files in the CLI.
- Cache stats reads (`bento stats site --json`). Stats HTTP endpoints allow about 30 requests per hour per IP.
- Do not recommend geolocation lookup. The API returns `{}`.
- Tag delete over HTTP is `DELETE /fetch/tags/:id` with a `tag.name` body. Use `bento tags list` first.
- Broadcast list defaults to sent. `bento broadcasts create` creates drafts for dashboard review.

## Use This, Not That

- Use `bento subscribers import contacts.csv`, not a shell loop over per-user subscriber writes. The CLI has no per-subscriber upsert command.
- Use `--dry-run` and `--limit`, not full imports as the first execution.
- Use `--json` for scripts, not parsing human-readable tables.
- Use named profiles for staging/production, not swapping credentials by hand.
- Use `--confirm` only after previewing the exact target set.
- Use the CLI repo's shipped `skill/` command reference as the source of truth for detailed command coverage; this file is the routing reference for the broader Bento skill package.

## Verification

```bash
npx @bentonow/bento-cli --help
bento auth status
bento stats site --json
bento subscribers import contacts.csv --dry-run --limit 10
```

Test scripts by asserting exit codes and JSON shape. Bulk scripts must cover missing `email`, malformed CSV, dry-run behavior, and API failure handling.
