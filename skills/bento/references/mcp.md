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
- Use sequence email and template update tools only with explicit user-provided subject and HTML.
- For large HTML changes, ask the user to keep content in a file or provide a clear diff.

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
