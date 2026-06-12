# Bento Skills

<img align="right" src="https://app.bentonow.com/brand/logoanim.gif">

> [!TIP]
> Need help? Join our [Discord](https://discord.gg/ssXXFRmt5F) or email support@bentonow.com.

Bento Skills helps AI agents work with Bento accounts and Bento integrations without guessing API shapes. Install one `bento` skill, then ask your agent to inspect a project, choose the right Bento tool, and use safe account-operation patterns.

Use it when you want an agent to:

* Add Bento to an application with an official SDK.
* Build or review subscriber syncs, event tracking, transactional email, broadcasts, validation, and reporting code.
* Choose between the Bento CLI, Bento MCP, an SDK, or the n8n node.
* Keep API credentials out of source code and avoid unsafe bulk operations.

This is the official Bento-maintained skill package. Install it from [github.com/bentonow/bento-skills](https://github.com/bentonow/bento-skills), and use [GitHub Issues](https://github.com/bentonow/bento-skills/issues) or support@bentonow.com for support. Bento's privacy policy is at [bentonow.com/legal/privacy](https://bentonow.com/legal/privacy).

Get the product docs at [docs.bentonow.com](https://docs.bentonow.com). For the maintained agent onboarding guide, use [bentonow.com/agent_onboarding.md](https://bentonow.com/agent_onboarding.md).

## Install

Install the skill package with the `skills` CLI:

```bash
npx skills add https://github.com/bentonow/bento-skills
```

Installing this package adds agent guidance files to your supported AI tool. It does not call the Bento API, read your Bento account, or require Bento credentials during install.

Install only the `bento` skill globally and skip prompts:

```bash
npx skills add https://github.com/bentonow/bento-skills --skill bento -g -y
```

Install for specific agents when needed:

```bash
npx skills add https://github.com/bentonow/bento-skills -a claude-code -a codex -a opencode -a amp
```

## First Safe Prompts

Start with read-only or planning requests before asking an agent to change customer data:

```text
Use the Bento skill to inspect this project and tell me which Bento SDK or tool fits best.
```

```text
Use the Bento skill to review this subscriber import for batching, credentials, and dry-run safety.
```

```text
Use the Bento skill to plan a safe customer sync from this app to Bento. Do not write code yet.
```

When you are ready to make changes, ask for explicit previews and verification:

```text
Use the Bento skill to add a queued Laravel subscriber sync. Use bulk import, keep credentials in env, and add tests for payload shape and retries.
```

```text
Use the Bento skill to create a CLI import workflow. Run a dry run with a small limit before any confirmed import.
```

## Credentials And Safety

Bento integrations usually need:

* `BENTO_SITE_UUID`
* `BENTO_PUBLISHABLE_KEY`
* `BENTO_SECRET_KEY`

Find API keys in the Bento dashboard under account/team API settings. Different SDKs may name these logical credentials differently, such as `username` and `password` in some clients; follow the selected reference file.

Keep credentials in environment variables, framework secret storage, the Bento CLI profile store, n8n credentials, or MCP client configuration. Do not paste real secret keys into source code, tests, markdown examples, or chat messages you plan to share. The publishable key can appear in approved client-side tracking paths, but the secret key must stay server-side and out of git, logs, shared agent configs, and browser bundles.

For customer data operations:

* Preview bulk imports with `--dry-run`, `--limit`, or an app-level preview before running them against a real account.
* Confirm destructive or high-volume changes before execution, including unsubscribes, tag removals, email sends, and large subscriber imports.
* Use events for behavior that should trigger automations. Use command/tag/field/subscription APIs for profile state changes.
* Prefer SDK batch APIs, the Bento CLI import command, or n8n batching over one API call per subscriber.
* Keep secret-key operations server-side.

## Which Bento Tool To Use

The parent skill routes agents to one focused reference at a time so normal tasks do not load every SDK into context.

| Tool | Use When | Reference |
| --- | --- | --- |
| Bento MCP | A supported AI assistant needs to inspect or operate on a live Bento account from chat. | `skills/bento/references/mcp.md` |
| Bento CLI | You need terminal automation, CSV imports, profiles, JSON output, or CI jobs. | `skills/bento/references/cli.md` |
| Node SDK | You are building server-side JavaScript, TypeScript, or Bun code. | `skills/bento/references/node.md` |
| Laravel SDK | You are building a Laravel app with Facades, DTOs, queues, config, and mail transport. | `skills/bento/references/laravel.md` |
| PHP SDK | You are building plain PHP or non-Laravel Composer code. | `skills/bento/references/php.md` |
| Drupal SDK | You are building a Drupal 10 module or using Webform, Commerce, cron, queues, or Drupal mail. | `skills/bento/references/drupal.md` |
| Go SDK | You are building Go services with context-aware clients. | `skills/bento/references/go.md` |
| .NET SDK | You are building ASP.NET Core or .NET services with DI and typed services. | `skills/bento/references/dotnet.md` |
| Elixir SDK | You are building Elixir or Phoenix apps with supervised workers. | `skills/bento/references/elixir.md` |
| Python SDK | You are building Python services, scripts, or jobs. | `skills/bento/references/python.md` |
| Ruby SDK | You are building Ruby or Rails apps with background jobs. | `skills/bento/references/ruby.md` |
| n8n node | You are building no-code or low-code workflows. | `skills/bento/references/n8n.md` |

## Helper Script

The bundled helper is read-only. It prints guidance for agents and contributors; it does not install packages or change your project.

```bash
node skills/bento/scripts/bento-sdk.mjs list
node skills/bento/scripts/bento-sdk.mjs detect .
node skills/bento/scripts/bento-sdk.mjs install node
node skills/bento/scripts/bento-sdk.mjs doctor .
```

`doctor` identifies likely SDKs, credentials, setup commands, and verification commands for the current project.

## Examples

### Safe CLI subscriber import

```bash
bento subscribers import contacts.csv --dry-run --limit 10
bento subscribers import contacts.csv --confirm --json
```

### Node server-side subscriber import

```ts
import { Analytics } from '@bentonow/bento-node-sdk';

const bento = new Analytics({
  authentication: {
    publishableKey: process.env.BENTO_PUBLISHABLE_KEY!,
    secretKey: process.env.BENTO_SECRET_KEY!,
  },
  siteUuid: process.env.BENTO_SITE_UUID!,
});

await bento.V1.Batch.importSubscribers({
  subscribers: [{ email: 'jane@example.com', firstName: 'Jane', tags: 'customer' }],
});
```

### Laravel queued sync shape

```php
use Bentonow\BentoLaravel\Facades\Bento;
use Bentonow\BentoLaravel\DataTransferObjects\ImportSubscribersData;

return Bento::importSubscribers(collect([
    new ImportSubscribersData(
        email: 'jane@example.com',
        first_name: 'Jane',
        tags: ['customer'],
        fields: ['plan' => 'pro'],
    ),
]))->json();
```

## Local Validation

Run the local validator and then exercise the skills install path:

```bash
npm run validate
npx -y skills add . --list
```

## Contributing

Keep `skills/bento/SKILL.md` small and route SDK-specific detail into `skills/bento/references/<sdk>.md`. Customer-facing examples must use real commands or method names from the current Bento CLI, MCP server, n8n node, or official SDKs.

When changing CLI guidance, check the shipped CLI skill in `../bento-cli/skill/` and the command implementations in `../bento-cli/src/commands/`. The CLI repo owns the deep command reference; this repo owns customer-facing routing across Bento's AI surfaces.

## License

MIT. See `LICENSE`.
