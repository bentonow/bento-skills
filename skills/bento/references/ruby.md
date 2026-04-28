# Bento Ruby SDK

Use for Ruby and Rails applications that should use a Rails initializer, background jobs, and the `bento-sdk` gem.

## Install And Detect

Add to `Gemfile`:

```ruby
gem 'bento-sdk', github: "bentonow/bento-ruby-sdk", branch: "master"
```

Then run:

```bash
bundle install
```

Detect from project/files:

- `Gemfile` or gemspec references `bento-sdk`
- `Bento.configure`
- `Bento::Subscribers`, `Bento::Events`, `Bento::Emails`, or `Bento::Spam`

Configure in Rails:

```ruby
# config/initializers/bento.rb
Bento.configure do |config|
  config.site_uuid = ENV.fetch('BENTO_SITE_UUID')
  config.publishable_key = ENV.fetch('BENTO_PUBLISHABLE_KEY')
  config.secret_key = ENV.fetch('BENTO_SECRET_KEY')
end
```

## Preferred Integration Recipes

Subscribers:

- Use `Bento::Subscribers.import([...])` for audience sync/import flows.
- Treat import as upsert-style sync; include email, profile fields, tags, and remove tags when present.
- Use `find_or_create_by` only for single user flows.

Events:

- Use `Bento::Events.import([...])` for batches/backfills.
- Use `Bento::Events.track(email:, type:, fields:, details:)` for single behavior events.
- Use events for automation triggers, not custom fields pretending to be events.

Tags and fields:

- Use `Bento::Subscribers.add_tag/remove_tag/add_field/remove_field`.
- Use `subscribe`, `unsubscribe`, and `change_email` for subscription state.

Transactional email and validation:

- Use `Bento::Emails.send` or `send_transactional` for direct SDK email sends.
- If the app wants ActionMailer integration, install the separate Bento ActionMailer gem; do not assume it is bundled in `bento-sdk`.
- Use `Bento::Spam.valid?` and `Bento::Spam.risky?` for email validation/risk checks.

Broadcasts and stats:

- The Ruby SDK is intentionally opinionated and does not expose every Bento API. If a needed endpoint is missing, create one isolated adapter using shared Bento config rather than scattering raw HTTP calls.

## Use This, Not That

- Use `Bento::Subscribers.import`, not `users.find_each { find_or_create_by(...) }`.
- Use ActiveJob/Sidekiq/Resque for sync jobs and retries, not controller loops.
- Use the Rails initializer and env secrets, not inline config.
- Use SDK resource methods first; isolate raw HTTP fallbacks.

## Verification

```bash
bundle exec rake
bundle exec rspec
```

Test background jobs with mocked Bento resources. Cover batch payloads, retry behavior, and configuration errors.
