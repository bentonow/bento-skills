# Bento Skills

Install one parent `bento` skill for AI agents that build Bento integrations across the Bento CLI and SDKs.

## Expected Outcomes

Using this package should help AI agents produce Bento integrations that:

- Pick the correct Bento SDK or CLI path for the project and framework.
- Install and configure Bento with the framework's native dependency, config, secret, queue, job, cron, workflow, or DI systems.
- Sync users through bulk subscriber import/upsert-style flows instead of per-user API loops.
- Track behavior with events and event batches, while using tag/field/subscription commands for profile state changes.
- Keep `BENTO_SITE_UUID`, `BENTO_PUBLISHABLE_KEY`, and `BENTO_SECRET_KEY` out of source code.
- Use framework-native mail paths for transactional email and require verified Bento authors.
- Add practical verification steps and tests for payload shape, batching, credentials, retries, and failure handling.
- Load only the relevant SDK reference for the task, reducing skill/context bloat across Claude Code, Codex, OpenCode, Amp, and other supported agents.

## Grounded Usage Examples

These are the kinds of real SDK patterns the skill should steer agents toward.

CLI bulk subscriber sync:

```bash
bento subscribers import contacts.csv --dry-run --limit 10
bento subscribers import contacts.csv --confirm --json
```

Node server-side subscriber import:

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

Laravel queued user sync shape:

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

Drupal service usage:

```php
$bento = \Drupal::service('bento.sdk');

$bento->importSubscribers([
  ['email' => 'jane@example.com', 'first_name' => 'Jane', 'tags' => 'customer'],
]);

$bento->sendEvent([
  'type' => '$completed_onboarding',
  'email' => 'jane@example.com',
  'fields' => ['first_name' => 'Jane'],
]);
```

Go batch import with context:

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

.NET service injection:

```csharp
var subscribers = new List<SubscriberRequest>
{
    new(Email: "jane@example.com", FirstName: "Jane", Tags: new[] { "customer" })
};

var response = await _subscriberService.ImportSubscribersAsync<dynamic>(subscribers);
```

Other SDK equivalents:

- PHP: `$bento->V1->Batch->importSubscribers(['subscribers' => $rows]);`
- Python: `bento.batch_create_subscribers(subscribers)`
- Ruby: `Bento::Subscribers.import([{email: 'jane@example.com', first_name: 'Jane'}])`
- Elixir: `BentoSdk.Subscribers.import([%{email: "jane@example.com", first_name: "Jane"}])`
- n8n: use the Bento node with n8n credentials, Split In Batches, Subscriber operations, Track Event, Continue On Fail, and execution logs instead of custom HTTP loops.

```bash
npx skills add https://github.com/bentonow/bento-skills
```

Install for specific agents when needed:

```bash
npx skills add https://github.com/bentonow/bento-skills -a claude-code -a codex -a opencode -a amp
```

Install only the Bento skill globally and skip prompts:

```bash
npx skills add https://github.com/bentonow/bento-skills --skill bento -g -y
```

The skill is intentionally a single parent skill. It routes agents to one SDK reference at a time so ordinary tasks do not load every Bento SDK into context.

## Local Validation

```bash
npm run validate
npx skills add . --list
```

The helper script is read-only:

```bash
node skills/bento/scripts/bento-sdk.mjs list
node skills/bento/scripts/bento-sdk.mjs detect .
node skills/bento/scripts/bento-sdk.mjs install node
node skills/bento/scripts/bento-sdk.mjs doctor .
```
