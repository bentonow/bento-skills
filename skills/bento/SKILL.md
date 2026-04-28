---
name: bento
description: Build correct Bento integrations with the Bento CLI and official Bento SDKs for Node, Laravel, PHP, Drupal, Go, .NET, Elixir, Python, Ruby, and n8n. Use when adding Bento to an application, syncing subscribers, tracking events, sending transactional email, creating broadcasts, validating email, configuring API credentials, reviewing Bento SDK usage, or choosing the right Bento SDK/package for a project. Emphasizes framework-native setup, bulk/upsert-style subscriber imports, secure credentials, queues/jobs/workflows, SDK-specific install commands, and avoiding per-user loops where batch APIs exist.
---

# Bento

Use this skill to build framework-native Bento integrations, not just syntactically valid SDK calls. Prefer the host framework's configuration, dependency injection, queue, job, workflow, cron, and credential systems.

## Workflow

1. Detect the target SDK from the user's request or project files. If unclear, run:
   ```bash
   node skills/bento/scripts/bento-sdk.mjs detect .
   ```
2. If the SDK is missing, print the install instructions. Do not install automatically unless the user explicitly asks:
   ```bash
   node skills/bento/scripts/bento-sdk.mjs install node
   node skills/bento/scripts/bento-sdk.mjs install laravel
   ```
3. Load only the relevant reference file from the table below. Load multiple files only for migration or cross-framework work.
4. Implement using the SDK's native abstractions first. Drop to raw HTTP only when the selected SDK does not expose the endpoint.
5. Verify with the SDK/framework's local checks and add tests around payload shape, batching, auth config, and failure handling.

## SDK References

| SDK | Read when working with | Reference |
| --- | --- | --- |
| CLI | terminal automation, CSV imports, safe bulk operations | `references/cli.md` |
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
- Store `BENTO_SITE_UUID`, `BENTO_PUBLISHABLE_KEY`, and `BENTO_SECRET_KEY` in environment variables, encrypted framework config, or the host platform's credential store. Never inline real credentials in source.
- Configure a reusable Bento client/service once through the framework container or module system where available.
- Put bulk sync, transactional mail, and retryable API calls behind queues, jobs, workers, cron, or n8n workflow batching when the host framework supports them.
- Chunk large batches to the selected SDK's documented limits. Keep failures inspectable and retry only failed chunks/items.
- Keep secret-key operations server-side. Browser/client code must not receive the Bento secret key.
- For destructive or large email/subscriber operations, add a dry-run or preview path whenever the selected SDK/CLI or application workflow allows it.

## Common Request Routing

- "Sync all users/customers/subscribers": use the selected SDK's bulk subscriber import/upsert path, chunked and retryable.
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
node skills/bento/scripts/bento-sdk.mjs install laravel
node skills/bento/scripts/bento-sdk.mjs doctor .
```

Use `doctor` before changing an unfamiliar project. It identifies likely SDKs, required credentials, the reference to load, install commands, and verification commands.
