# Audit Log

Every change in **можно**<span class=brand-dot>.</span> is recorded: who changed what and when. The audit log stores the full history of changes to flags, segments, API keys, and settings.

## What Gets Logged

| Resource | Events |
|----------|--------|
| **Flags** | Creation, strategy changes, targeting changes, renaming, archival, restoration, deletion |
| **Segments** | Creation, rule changes, renaming, deletion |
| **API keys** | Creation, regeneration, revocation, deletion |
| **Environments** | Creation, renaming, deletion |
| **Project** | Settings changes, renaming |
| **Users** | Invitation, role change, deletion |

## Viewing the Audit Log

### Dashboard

The **Audit** section is accessible from the main menu.

Each entry contains:

| Field | Description | Example |
|-------|-------------|---------|
| **Date and time** | When the change occurred (UTC) | `2026-06-21 13:41:05` |
| **User** | Who made the change | `admin@example.com` |
| **Resource** | What was changed | `Flag new-checkout` |
| **Action** | Type of change | `Strategy updated` |
| **Details** | Additional event information | `Key: new-checkout` |

## Filtering the Audit Log

### By Time

Arbitrary date range filtering is available.

### By User

Shows every action by a specific administrator or developer.

### By Resource

Full change history of a single flag — from creation to archival.

### By Action Type

Creation, update, deletion, archival, authentication.

### Combining Filters

Show all flag changes made by a developer in the last week — combine time, user, resource, and action filters.

## Audit Log Storage

**можно**<span class=brand-dot>.</span> stores the audit log in PostgreSQL. Entries are never modified — the audit log is an append-only store.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `MOZHNO_AUDIT_RETENTION_DAYS` | `365` | How long audit entries are kept |

Entries older than this are automatically purged once per day.

### Integrity

- Entries are **never edited** after creation
- Entries **cannot be deleted** via the dashboard (direct SQL only)
- Each entry has a unique ID and microsecond-precision timestamp

## Integration with External Systems

Configure a [webhook](/en/guide/integrations) for an event (e.g. `flag.updated`) to receive notifications on changes.

## Next Steps

- [Integrations](/en/guide/integrations) — configure webhooks
- [Best Practices](/en/guide/best-practices) — cleanup strategy and flag management
- [Flag Workflow](/en/guide/flags-workflow) — flag lifecycle
