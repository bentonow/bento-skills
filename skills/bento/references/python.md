# Bento Python SDK

Use for Python services, scripts, jobs, and data-sync tasks using `bento_api.BentoAPI`.

## Install And Detect

Install:

```bash
pip install git+https://github.com/bentonow/bento-python-sdk.git
```

Detect from project/files:

- `from bento_api import BentoAPI`
- `setup.py` package name `bento-api`
- calls like `batch_create_subscribers`

Configure:

```python
import os
from bento_api import BentoAPI

bento = BentoAPI(
    site_uuid=os.environ["BENTO_SITE_UUID"],
    username=os.environ["BENTO_PUBLISHABLE_KEY"],
    password=os.environ["BENTO_SECRET_KEY"],
)
```

## Preferred Integration Recipes

Subscribers:

- Use `bento.batch_create_subscribers(subscribers)` for audience syncs.
- Treat batch create as upsert-style subscriber import for sync jobs.
- Include email, first/last names, tags, remove tags, and custom fields where supported by the payload.
- Use `get_subscriber` and `create_subscriber` only for small interactive flows.

Events:

- Use `bento.batch_create_events(events)` for event backfills/high-volume tracking.
- Put event backfills in jobs with explicit chunk sizes and retry state.

Tags and fields:

- Use `bento.execute_commands([...])` for tag, field, subscription, and email-change commands.
- Use `bento.create_tag` and `bento.create_field` for schema setup.

Transactional email, broadcasts, stats, validation:

- Use `bento.batch_create_emails(emails)` for email batches.
- Use `bento.batch_create_broadcasts(...)` and `bento.get_broadcasts()`.
- Use `bento.get_site_stats()`.
- Use `bento.validate_email(...)` and `bento.check_blacklist(...)`.

## Use This, Not That

- Use `batch_create_subscribers`, not a Python `for` loop around `create_subscriber`.
- Use one configured client per job/service, not rebuilding `requests.Session` per row.
- Use environment variables or a secret manager, not inline credentials.
- Use queue/task systems such as Celery, RQ, Django-Q, or framework-native background tasks for imports.
- Use typed wrappers/Pydantic models in application code if payloads are assembled from untrusted input.

## Verification

```bash
python -c "from bento_api import BentoAPI; print(BentoAPI.__name__)"
python -m pytest
```

Mock `requests.Session.request`. Cover batch chunking, invalid rows, `BentoAPIError`, and env/config loading.
