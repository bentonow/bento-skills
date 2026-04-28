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

- Use `bento events import events.json` for bulk backfills.
- Use `bento events track --email ... --event ... --details ...` for a single manual action.
- Use `bento events purchase` for purchases so value, unique key, currency, and cart details are preserved.

Tags and fields:

- Use `bento subscribers tag --file users.csv --add tag --confirm` for bulk tag changes.
- Use `bento subscribers field update --fields '{...}'` when field changes should trigger automations.
- Use `bento subscribers field set` for direct field updates that should not trigger automations.

Broadcasts and content:

- Use `bento broadcasts list --json` for automation.
- Before creating broadcasts, require explicit audience tags/segments and batch size.
- Prefer HTML files with `--html-file` for long sequence/template content.

## Use This, Not That

- Use CSV import, not a shell loop that calls `subscribers upsert` once per user.
- Use `--dry-run` and `--limit`, not full imports as the first execution.
- Use `--json` for scripts, not parsing human-readable tables.
- Use named profiles for staging/production, not swapping credentials by hand.
- Use `--confirm` only after previewing the exact target set.

## Verification

```bash
npx @bentonow/bento-cli --help
bento auth status
bento stats site --json
bento subscribers import contacts.csv --dry-run --limit 10
```

Test scripts by asserting exit codes and JSON shape. Bulk scripts must cover missing `email`, malformed CSV, dry-run behavior, and API failure handling.
