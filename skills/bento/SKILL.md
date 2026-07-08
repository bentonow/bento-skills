---
name: bento
description: Build correct Bento integrations and choose the right Bento AI surface across Bento MCP, the Bento CLI, and official Bento SDKs for Node, Laravel, PHP, Drupal, Go, .NET, Elixir, Python, Ruby, and n8n. Use when adding Bento to an application, working with a live Bento account through an AI assistant, syncing subscribers, tracking events, sending transactional email, creating broadcasts, validating email, configuring API credentials, reviewing Bento SDK usage, or choosing the right Bento tool for a project. Emphasizes safe customer account operations, framework-native setup, bulk/upsert-style subscriber imports, secure credentials, queues/jobs/workflows, SDK-specific install commands, and avoiding per-user loops where batch APIs exist.
---

# Bento

Use this skill to help customers work with Bento safely through AI agents. Build framework-native Bento integrations, not just syntactically valid SDK calls. Prefer the host framework's configuration, dependency injection, queue, job, workflow, cron, and credential systems.

For current customer onboarding guidance, refer to https://bentonow.com/agent_onboarding.md. Treat it as the maintained source for agent-facing Bento setup and safety context, then use the local reference files below for SDK/tool-specific implementation details.

## Workflow

1. Decide whether the user needs live account operations, terminal automation, no-code workflow work, or application code. Use Bento MCP for supported chat-native account operations, the CLI for terminal/CSV/CI work, n8n for workflows, and SDK references for application code.
2. Detect the target SDK from the user's request or project files. If unclear, run:
   ```bash
   node skills/bento/scripts/bento-sdk.mjs detect .
   ```
3. If the SDK is missing, print the install instructions. Do not install automatically unless the user explicitly asks:
   ```bash
   node skills/bento/scripts/bento-sdk.mjs install node
   node skills/bento/scripts/bento-sdk.mjs install laravel
   ```
4. Load only the relevant reference file from the tables below. Load multiple files only for migration or cross-surface work.
5. Implement using the selected product's native abstractions first. Drop to raw HTTP only when the selected SDK or tool does not expose the endpoint.
6. Verify with the product/framework's local checks and add tests around payload shape, batching, auth config, and failure handling.

## AI Account Operations

| Surface | Read when working with | Reference |
| --- | --- | --- |
| Bento MCP | live Bento account inspection or account operations from a supported AI assistant, using hosted remote MCP at `https://mcp.bentonow.com/mcp` or local `@bentonow/bento-mcp` | `references/mcp.md` |
| Bento CLI | terminal automation, CSV imports, safe bulk operations | `references/cli.md` |

## SDK References

| SDK | Read when working with | Reference |
| --- | --- | --- |
| Node | Node.js, Bun, TypeScript, server-side JavaScript | `references/node.md` |
| Laravel | Laravel apps, Facades, DTOs, mail transport, Artisan | `references/laravel.md` |
| PHP | plain PHP, Composer libraries, non-Laravel PHP apps | `references/php.md` |
| Drupal | Drupal 10 modules, Webform, Commerce, Drupal mail | `references/drupal.md` |
| Go | Go services using `context.Context` and typed structs | `references/go.md` |
| .NET | ASP.NET Core, DI, appsettings, typed services | `references/dotnet.md` |
| Elixir | Mix apps, Phoenix, OTP workers, tuple results | `references/elixir.md` |
| Python | Python services/scripts using `bento_api.BentoAPI` | `references/python.md` |
| Ruby | Rails apps and Ruby services using `bento-sdk` | `references/ruby.md` |
| n8n | n8n community node workflows | `references/n8n.md` |

## Integration Rules

- Prefer bulk subscriber APIs for audience sync/import flows. Do not loop over individual subscriber creation when the SDK has `importSubscribers`, `ImportSubscribersAsync`, `Subscribers.import`, `batch_create_subscribers`, or an equivalent batch method.
- Treat subscriber import as an upsert-style audience sync unless the selected SDK reference explicitly says otherwise. Design it to be idempotent and retryable.
- Use event tracking for behavior and automation triggers. Use field/tag/subscription commands for profile state changes.
- Store the three logical Bento credentials, site UUID, publishable key, and secret key, in environment variables, encrypted framework config, the CLI profile store, n8n credentials, or the MCP host's credential configuration. Some SDKs name publishable/secret as username/password; follow the selected reference. Never inline real credentials in source.
- Configure a reusable Bento client/service once through the framework container or module system where available.
- Put bulk sync, transactional mail, and retryable API calls behind queues, jobs, workers, cron, or n8n workflow batching when the host framework supports them.
- Chunk large batches to the selected SDK's documented limits. Keep failures inspectable and retry only failed chunks/items.
- Keep secret-key operations server-side. Browser/client code must not receive the Bento secret key.
- For destructive or large email/subscriber operations, add a dry-run or preview path whenever the selected SDK/CLI or application workflow allows it.
- For live customer accounts, start with read-only inspection or a plan. Ask for explicit confirmation before destructive, high-volume, or email-sending actions.

## API Guardrails

These match the current Rails `/api/v1` behavior. Prefer list/read tools before create, update, or delete operations.

- **Commands are async.** `POST /fetch/commands` returns `{ results }` with a queued command count. It does not return the updated subscriber synchronously.
- **Subscriber import vs create.** Use `POST /batch/subscribers` (up to 1000 records, no automations) for audience sync/import. Use `POST /fetch/subscribers` only for single creates that may trigger automations.
- **Batch sizes.** Events: up to 1000 per request. Subscribers: up to 1000. Transactional emails: up to 60.
- **Stats caching.** `/stats/*` is limited to about 30 requests per hour per IP. Cache stats in the app; do not poll on every page view.
- **Fetch/batch pace.** `/fetch/*` and `/batch/*` are limited to about 60 requests per minute per IP.
- **Tag delete route.** Delete tags with `DELETE /fetch/tags/:id` and a JSON body `{ "tag": { "name": "..." } }`. List tags first to get the id.
- **Sequence IDs.** Use the `id` returned by `GET /fetch/sequences` (or `list_sequences` in MCP). Do not invent IDs like `sequence_abc123`.
- **Blacklist check.** Call `GET /experimental/blacklist` with query params `domain` and/or `ip`. Do not use `blacklist.json` or `ip_address` as the param name.
- **Geolocation disabled.** `GET /experimental/geolocation` returns `{}`. Do not recommend it for enrichment.
- **Broadcast defaults.** `GET /fetch/broadcasts` defaults to `status=sent` when omitted. API-created broadcasts start as drafts; review before sending.
- **List before write.** List tags, fields, sequences, broadcasts, and subscribers before creating duplicates or targeting the wrong record.

## Common Request Routing

- "Sync all users/customers/subscribers": use the selected SDK's bulk subscriber import/upsert path, chunked and retryable.
- "Look up this subscriber/list my tags/show broadcasts from chat": use Bento MCP if configured.
- "Import this CSV or run this in CI": use the Bento CLI with preview and JSON output.
- "Track signup/purchase/page view/form submission": use event tracking or event batch import, not field updates.
- "Add/remove a tag or field": use subscriber command/tag/field APIs unless the user explicitly needs an automation-triggering event.
- "Send order receipt/password reset/transactional email": use the SDK/framework transactional mail path, verified authors, queues/jobs, and secret server-side config.
- "Create/send/list broadcasts": require explicit audience targeting and batching/rate settings; use preview/dry-run when available.
- "Validate emails or check risk": use the SDK's validation/blacklist/spam API and cache or batch results where the framework supports it.

## Helper Script

The bundled helper is read-only and prints guidance only:

```bash
node skills/bento/scripts/bento-sdk.mjs list
node skills/bento/scripts/bento-sdk.mjs detect .
node skills/bento/scripts/bento-sdk.mjs install mcp
node skills/bento/scripts/bento-sdk.mjs install laravel
node skills/bento/scripts/bento-sdk.mjs doctor .
```

Use `doctor` before changing an unfamiliar project. It identifies likely SDKs, required credentials, the reference to load, install commands, and verification commands.
