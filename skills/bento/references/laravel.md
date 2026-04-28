# Bento Laravel SDK

Use for Laravel 10+ applications that should follow Laravel conventions: service provider auto-discovery, Facades, DTOs, Artisan setup, mail transport, queues, jobs, and config/env.

## Install And Detect

Install:

```bash
composer require bentonow/bento-laravel-sdk
php artisan bento:install
```

Detect from project/files:

- `composer.json` dependency `bentonow/bento-laravel-sdk`
- namespace `Bentonow\BentoLaravel`
- Facade calls like `Bento::importSubscribers(...)`
- Artisan commands `bento:install`, `bento:test`, or `bento:validate`

Configure via `.env` or the installer:

```dotenv
BENTO_PUBLISHABLE_KEY="..."
BENTO_SECRET_KEY="..."
BENTO_SITE_UUID="..."
MAIL_MAILER=bento
MAIL_FROM_ADDRESS="verified-author@example.com"
```

## Preferred Integration Recipes

Subscribers:

- Use `Bento::importSubscribers($collectionOfImportSubscribersData)` for user syncs.
- Treat import as upsert-style audience sync. Include stable email, fields, tags, and removeTags.
- Run imports from queued jobs or scheduled commands, not web request loops.
- Use `Bento::findSubscriber(...)` only for lookup flows.

Events:

- Use `Bento::trackEvent(collect([new EventData(...) ...]))` for batched events.
- Use `Bento::track($email, $type, $fields, $details)` for concise single-event paths.
- Use `Bento::trackPurchase(...)` for purchases so purchase details are structured for Bento automations.

Tags and fields:

- Use `Bento::subscriberCommand(collect([new CommandData(Command::ADD_TAG, ...)]))`.
- Use command DTOs for tag, field, subscription, and email-change state.
- Use events instead when the change is behavioral and should trigger event-based automations.

Transactional email:

- Use Laravel mail with `MAIL_MAILER=bento` for application mail.
- Keep mail work queued when sending at scale.
- Run `php artisan bento:test` after setup to validate mail configuration.

Broadcasts, stats, validation:

- Use `Bento::getTags()`, `getFields()`, `getBroadcasts()`, `createBroadcast(...)`.
- Use `Bento::getSiteStats()`, `getSegmentStats(...)`, and `getReportStats(...)`.
- Use `Bento::validateEmail(new ValidateEmailData(...))` before accepting high-risk addresses.

## Use This, Not That

- Use the Facade and DTOs, not hand-built HTTP requests.
- Use queued jobs for imports and event backfills, not controller loops.
- Use `importSubscribers` for user syncs, not `createSubscriber` per user.
- Use the Bento mail transport, not manually sending email payloads from every Mailable.
- Use `bento:install`, `bento:test`, and `bento:validate`, not guessing config shape.

## Verification

```bash
php artisan bento:test
php artisan bento:validate
./vendor/bin/pest
./vendor/bin/pint --test
```

Test queued jobs with faked queues/HTTP where possible. Cover DTO construction, chunking, retry behavior, env/config resolution, and mail transport selection.
