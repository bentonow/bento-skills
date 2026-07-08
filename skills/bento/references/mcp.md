# Bento MCP

Use Bento MCP when a supported AI assistant should inspect or operate on a live Bento account from chat. Prefer MCP for account lookups, lists, reporting, and guided content changes. Prefer an SDK when you are changing application code, and prefer the CLI when data already lives in files or scripts.

## Install And Configure

For supported remote MCP clients, use Bento's hosted MCP server:

```text
https://mcp.bentonow.com/mcp
```

Use the hosted server when the assistant or MCP client supports remote MCP over HTTP.

For clients that expect a local stdio server, run the setup wizard:

```bash
npx -y @bentonow/bento-mcp setup
```

Or configure the MCP server manually with:

```bash
npx -y @bentonow/bento-mcp
```

Required credentials:

- `BENTO_SITE_UUID`
- `BENTO_PUBLISHABLE_KEY`
- `BENTO_SECRET_KEY`

Store credentials in the MCP client's configuration, remote MCP connection settings, or Bento MCP's setup-managed env file. Do not hardcode secret keys into project files.

## Preferred Account Workflows

Subscribers:

- Use MCP for lookups by email or UUID before proposing subscriber changes.
- Use bulk subscriber import only when the user has provided an explicit list and confirmed the intended tags, fields, and subscription effects.
- Treat imports as upsert-style audience syncs.

Tags and fields:

- Use list operations before creating new tags or fields so the account does not accumulate duplicates.
- Create tags and fields only after confirming the naming convention.

Events and reporting:

- Use event tracking for one-off behavior that should trigger automations.
- Use site stats and ads stats for account reporting questions.

Broadcasts, sequences, workflows, and templates:

- Use list operations before creating or updating content.
- Create broadcasts as drafts and tell the user to review them in Bento before sending.
- Sequence email create tools append a new email. Sequence email update tools patch an existing template by numeric `templateId`.
- For large HTML changes, ask the user to keep content in a file or provide a clear diff.
- For sequence email creation, use the `id` returned by the sequence list tool. Do not invent a sequence ID or reuse an ID from another site.

## API Guardrails

- `POST /fetch/commands` is async and returns `{ results }`, not an updated subscriber payload.
- Prefer `POST /batch/subscribers` for imports (up to 1000, no automations). Reserve `POST /fetch/subscribers` for single creates.
- Cache `/stats/*` responses. The API allows about 30 requests per hour per IP.
- Do not use geolocation enrichment. `GET /experimental/geolocation` returns `{}`.
- Blacklist checks use `GET /experimental/blacklist?domain=...` or `&ip=...`.
- Tag deletes use `DELETE /fetch/tags/:id` with `{ "tag": { "name": "..." } }`. List tags first.
- List tags, fields, sequences, and broadcasts before write operations.
- Broadcast list defaults to sent status. New API broadcasts are drafts until reviewed in Bento.

## Hosted vs local tool names

Hosted MCP (`https://mcp.bentonow.com/mcp`) prefixes tools with `bento_`. Local stdio MCP (`@bentonow/bento-mcp`) uses unprefixed snake_case names for the same operations.

| Operation | Hosted MCP | Local MCP |
| --- | --- | --- |
| List sequences | `bento_list_sequences` | `list_sequences` |
| Create sequence email | `bento_create_sequence_email` | `create_sequence_email` |
| Update sequence email | `bento_update_sequence_email` | `update_sequence_email` |
| List tags | `bento_list_tags` | `list_tags` |
| Get subscriber | `bento_get_subscriber` | `get_subscriber` |

Use the sequence list result `id` for create URLs and `templateId` for updates.

## Use This, Not That

- Use MCP for live account inspection from chat, not ad hoc scripts with pasted credentials.
- Use the hosted MCP server when the client supports remote MCP; use `@bentonow/bento-mcp` when it needs a local stdio server.
- Use read-only MCP tools before write tools when the account state is unclear.
- Use SDKs for app integration code, not MCP calls embedded in production application paths.
- Use the CLI for CSV imports and CI automation, not manual chat copy-paste of large datasets.
- Ask for confirmation before destructive, high-volume, or email-sending actions.

## Verification

```bash
npx -y @bentonow/bento-mcp --help
npx -y @bentonow/bento-mcp setup --print
```

After configuration, run a read-only lookup or list operation before any write. Confirm the assistant is connected to the intended Bento site.
