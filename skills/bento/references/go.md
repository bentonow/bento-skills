# Bento Go SDK

Use for Go services that need typed structs, shared clients, context cancellation, and explicit timeout/retry control.

## Install And Detect

Install:

```bash
go get github.com/bentonow/bento-golang-sdk
```

Detect from project/files:

- `go.mod` require/import `github.com/bentonow/bento-golang-sdk`
- `bento.NewClient(&bento.Config{...})`
- calls like `client.ImportSubscribers(ctx, ...)`

Configure one client per service/process:

```go
client, err := bento.NewClient(&bento.Config{
    PublishableKey: os.Getenv("BENTO_PUBLISHABLE_KEY"),
    SecretKey:     os.Getenv("BENTO_SECRET_KEY"),
    SiteUUID:      os.Getenv("BENTO_SITE_UUID"),
    Timeout:       10 * time.Second,
})
```

## Preferred Integration Recipes

Subscribers:

- Use `client.ImportSubscribers(ctx, []*bento.SubscriberInput{...})` for sync/import flows.
- Treat import as upsert-style sync; include email, names, tags, remove tags, and fields.
- Use `FindSubscriber` for lookups and `CreateSubscriber` only for single interactive actions.

Events:

- Use `client.TrackEvent(ctx, []bento.EventData{...})` with batches for backfills and event streams.
- Use context deadlines for request lifetimes.
- For purchases, include `details.unique`, `details.value`, and cart details in the event payload.

Tags and fields:

- Use `client.SubscriberCommand(ctx, []bento.CommandData{...})`.
- Use `bento.CommandAddTag`, `CommandRemoveTag`, `CommandAddField`, `CommandRemoveField`, `CommandSubscribe`, `CommandUnsubscribe`, and `CommandChangeEmail`.

Transactional email, broadcasts, stats, validation:

- Use `client.CreateEmails(ctx, []bento.EmailData{...})` for one or more emails.
- Use `client.GetBroadcasts` and `client.CreateBroadcast`.
- Use `client.GetTags`, `client.GetFields`, and `client.GetSiteStats`.
- Use `client.ValidateEmail` and `client.GetBlacklistStatus`.

## Use This, Not That

- Use one configured `Client`, not a new client per user row.
- Use `context.Context` everywhere, not background calls without cancellation in request handlers.
- Use `ImportSubscribers` and `TrackEvent` with slices, not per-record API loops.
- Use typed structs and constants, not raw JSON maps unless the SDK type requires flexible fields.
- Chunk large slices and retry failed chunks, not an unbounded goroutine fan-out.

## Verification

```bash
go test ./...
go test -race ./...
go test -coverprofile=coverage.txt ./...
```

Use `httptest` or mocked `HTTPDoer` implementations. Test context cancellation, invalid config, chunking, command types, and payload JSON.
