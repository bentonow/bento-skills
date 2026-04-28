# Bento Skills

<img align="right" src="https://app.bentonow.com/brand/logoanim.gif">

> [!TIP]
> Need help? Join our [Discord](https://discord.gg/ssXXFRmt5F) or email jesse@bentonow.com for personalized support.

The Bento Skills package makes it quick and easy for AI agents to build excellent Bento integrations across the Bento CLI and official Bento SDKs. It provides one parent `bento` skill that routes agents to the right SDK reference for the project, then guides them toward framework-native setup, bulk subscriber import/upsert flows, secure credentials, queues/jobs/workflows, and SDK-specific verification.

Get started with our [integration guides](https://docs.bentonow.com), or browse the [Bento API reference](https://docs.bentonow.com/subscribers).

Table of contents
=================

<!--ts-->
* [Features](#features)
* [Requirements](#requirements)
* [Getting started](#getting-started)
    * [Installation](#installation)
    * [Agent-specific installation](#agent-specific-installation)
* [Usage](#usage)
* [Supported SDKs](#supported-sdks)
* [Examples](#examples)
* [Things to Know](#things-to-know)
* [Local Validation](#local-validation)
* [Contributing](#contributing)
* [License](#license)
<!--te-->

## Features

* **Single parent skill**: Install one `bento` skill instead of loading one skill per SDK.
* **SDK detection**: Helps agents identify whether a project uses the CLI, Node, Laravel, PHP, Drupal, Go, .NET, Elixir, Python, Ruby, or n8n package.
* **Framework-native setup**: Steers agents toward each framework's dependency, config, secret, queue, job, cron, workflow, or DI systems.
* **Bulk subscriber syncs**: Encourages subscriber import/upsert-style flows instead of per-user API loops.
* **Correct event modeling**: Uses events and event batches for behavior, while using tag/field/subscription commands for profile state.
* **Credential safety**: Keeps `BENTO_SITE_UUID`, `BENTO_PUBLISHABLE_KEY`, and `BENTO_SECRET_KEY` out of source code.
* **Grounded verification**: Adds SDK-specific checks and tests for payload shape, batching, credentials, retries, and failure handling.

## Requirements

This package requires:

* Node.js and `npx` to install with the `skills` CLI.
* An AI agent supported by the `skills` CLI, such as Claude Code, Codex, OpenCode, or Amp.
* A Bento account when building or testing live integrations.
* Bento API credentials for project integrations: **SITE_UUID**, **BENTO_PUBLISHABLE_KEY** and **BENTO_SECRET_KEY**.

## Getting started

### Installation

Install the Bento skill package:

```bash
npx skills add https://github.com/bentonow/bento-skills
```

Install only the Bento skill globally and skip prompts:

```bash
npx skills add https://github.com/bentonow/bento-skills --skill bento -g -y
```

### Agent-specific installation

Install for specific agents when needed:

```bash
npx skills add https://github.com/bentonow/bento-skills -a claude-code -a codex -a opencode -a amp
```

## Usage

After installation, ask your agent to use the Bento skill when adding, reviewing, or fixing a Bento integration.

Good requests include:

* "Use the Bento skill to add subscriber sync to this Laravel app."
* "Use the Bento skill to review this Node Bento integration for batch import mistakes."
* "Use the Bento skill to wire Drupal Webform submissions into Bento."
* "Use the Bento skill to build an n8n workflow that syncs subscribers without custom HTTP loops."

The bundled helper script is read-only and prints guidance only:

```bash
node skills/bento/scripts/bento-sdk.mjs list
node skills/bento/scripts/bento-sdk.mjs detect .
node skills/bento/scripts/bento-sdk.mjs install node
node skills/bento/scripts/bento-sdk.mjs doctor .
```

## Supported SDKs

The parent skill routes agents to one SDK reference at a time so ordinary tasks do not load every Bento SDK into context.

| SDK | Primary package or command | Best fit |
| --- | --- | --- |
| CLI | `npx @bentonow/bento-cli` | Terminal automation, CSV imports, CI jobs |
| Node | `@bentonow/bento-node-sdk` | Node.js, Bun, TypeScript server code |
| Laravel | `bentonow/bento-laravel-sdk` | Laravel apps, Facades, DTOs, mail transport |
| PHP | `bentonow/bento-php-sdk` | Plain PHP and non-Laravel Composer apps |
| Drupal | `drupal/bento_sdk` | Drupal 10, Webform, Commerce, Drupal mail |
| Go | `github.com/bentonow/bento-golang-sdk` | Go services with context-aware clients |
| .NET | `Bento.SDK` | ASP.NET Core, DI, appsettings, typed services |
| Elixir | `:bento_sdk` | Elixir/Phoenix apps and supervised workers |
| Python | `bento_api.BentoAPI` | Python services, scripts, and sync jobs |
| Ruby | `bento-sdk` | Ruby/Rails apps and background jobs |
| n8n | `n8n-nodes-bento` | n8n workflows and community node operations |

## Examples

### CLI bulk subscriber sync

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

### Laravel queued user sync shape

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

### Ruby subscriber import

```ruby
Bento::Subscribers.import([
  {
    email: 'jane@example.com',
    first_name: 'Jane',
    tags: 'customer',
    plan: 'pro'
  }
])
```

### Go batch import with context

```go
err := client.ImportSubscribers(ctx, []*bento.SubscriberInput{
    {
        Email: "jane@example.com",
        FirstName: "Jane",
        Tags: []string{"customer"},
        Fields: map[string]interface{}{"plan": "pro"},
    },
})
```

### .NET service injection

```csharp
var subscribers = new List<SubscriberRequest>
{
    new(Email: "jane@example.com", FirstName: "Jane", Tags: new[] { "customer" })
};

var response = await _subscriberService.ImportSubscribersAsync<dynamic>(subscribers);
```

### Other SDK equivalents

* PHP: `$bento->V1->Batch->importSubscribers(['subscribers' => $rows]);`
* Python: `bento.batch_create_subscribers(subscribers)`
* Elixir: `BentoSdk.Subscribers.import([%{email: "jane@example.com", first_name: "Jane"}])`
* Drupal: `$bento = \Drupal::service('bento.sdk'); $bento->importSubscribers($subscribers);`
* n8n: use the Bento node with n8n credentials, Split In Batches, Subscriber operations, Track Event, Continue On Fail, and execution logs instead of custom HTTP loops.

## Things to Know

* Subscriber import should be treated as an upsert-style audience sync unless the selected SDK says otherwise.
* Do not loop over users one by one when the SDK exposes a bulk import method.
* Use events for behavior and automation triggers; use tag, field, and subscription commands for profile state changes.
* Keep Bento credentials in environment variables, encrypted config, or the host platform credential store.
* The helper script does not install dependencies automatically. It prints the exact install/setup commands for the selected SDK.

## Local Validation

```bash
npm run validate
npx skills add . --list
```

The official skill validator can be run with:

```bash
uv run --with pyyaml python /Users/zero/.codex/skills/.system/skill-creator/scripts/quick_validate.py ./skills/bento
```

## Contributing

Keep the parent skill small and place SDK-specific details in `skills/bento/references/<sdk>.md`. New examples should use real method names from the SDKs and should prefer bulk, framework-native patterns.

## License

MIT License.
