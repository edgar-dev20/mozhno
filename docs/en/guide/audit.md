# Audit Log

Every change in можно is recorded in an immutable audit log. You can review who changed what, when, and see the exact difference between versions.

## Audit Log Overview

The audit log captures changes to all managed resources:

| Resource | Tracked Changes |
|----------|-----------------|
| **Flags** | Creation, state changes, targeting rules, rollout percentage, default value, type, tags, description |
| **Segments** | Creation, deletion, condition changes, name |
| **API Keys** | Creation, revocation, scope changes |
| **Environments** | Creation, deletion, configuration changes |

Each audit entry contains:

| Field | Description |
|-------|-------------|
| **Timestamp** | UTC timestamp of the change |
| **Actor** | Email of the user or API key name that made the change |
| **Action** | `CREATED`, `UPDATED`, `DELETED`, `ARCHIVED`, `RESTORED` |
| **Resource type** | `FLAG`, `SEGMENT`, `API_KEY`, `ENVIRONMENT` |
| **Resource identifier** | Flag key, segment name, etc. |
| **Diff** | Before/after snapshot of the changed fields |

## Viewing the Audit Log

### Dashboard

Navigate to **Audit Log** in the sidebar. The page shows a chronological list of all changes with infinite scroll and filtering.

### API

```bash
# List all audit entries (paginated)
curl "https://your-instance/api/v1/audit?page=0&size=20" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Filter by resource type
curl "https://your-instance/api/v1/audit?resourceType=FLAG&page=0&size=20" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Filter by flag key
curl "https://your-instance/api/v1/audit?resourceId=checkout_v2" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Filter by date range
curl "https://your-instance/api/v1/audit?from=2026-06-01T00:00:00Z&to=2026-06-21T23:59:59Z" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Filtering Audit Entries

The dashboard provides filter controls:

| Filter | Type | Description |
|--------|------|-------------|
| **Date range** | Date picker | Show changes within a time window |
| **Resource type** | Dropdown | `Flags`, `Segments`, `API Keys`, `Environments` |
| **Action** | Dropdown | `Created`, `Updated`, `Deleted`, `Archived`, `Restored`, `Paused`, `Resumed` |
| **Actor** | Text input | Filter by user email |
| **Resource ID** | Text input | Filter by specific flag key or segment name |

Filters combine with AND logic. For example: "Resource type: Flags AND Date: Last 7 days AND Action: Updated" shows flag changes in the past week.

## Diff View

When a resource is updated, the audit entry shows a diff of the changed fields. Click any audit entry to expand the diff view.

### Example Diff: Flag Rollout Change

```diff
Flag: checkout_v2
Changed by: alice@example.com
Date: 2026-06-21T10:30:00Z

  "rolloutPercentage": {
-   "before": 10,
+   "after": 25
  }
```

### Example Diff: Targeting Rule Addition

```diff
Flag: premium_features
Changed by: bob@example.com
Date: 2026-06-21T11:00:00Z

  "targetingRules": {
-   "before": [
-     {
-       "conditions": [{"attribute": "plan", "operator": "EQUALS", "value": "enterprise"}],
-       "targetValue": true
-     }
-   ],
+   "after": [
+     {
+       "conditions": [{"attribute": "plan", "operator": "EQUALS", "value": "enterprise"}],
+       "targetValue": true
+     },
+     {
+       "conditions": [{"attribute": "country", "operator": "EQUALS", "value": "DE"}],
+       "targetValue": true
+     }
+   ]
  }
```

> **Tip:** The diff view shows the complete field value, not just the changed portions. Use this to understand the full before and after state of each change.

## Exporting Audit Data

### Dashboard Export

From the audit log page, click **Export** to download a CSV file of the currently filtered results. The CSV includes:

```
Timestamp, Actor, Action, Resource Type, Resource ID, Summary
2026-06-21T10:30:00Z, alice@example.com, UPDATED, FLAG, checkout_v2, Rollout changed from 10% to 25%
```

### API Export

Use the API to programmatically extract audit data:

```bash
# Export all flag changes for June 2026
curl "https://your-instance/api/v1/audit/export?resourceType=FLAG&from=2026-06-01T00:00:00Z&to=2026-07-01T00:00:00Z" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Accept: text/csv" \
  -o audit_june_2026.csv
```

### Integration with External Tools

Use [webhooks](./integrations.md) to stream audit events to external systems. Configure a webhook for `flag.updated` or other resource events to forward changes as they happen.

## Use Cases

### Compliance and Security Review

Before a release or security audit, export the audit log for all flags in the release scope. Verify:

- No unauthorized changes to production flag states.
- Rollout percentages follow the approved plan.
- API key creation dates match onboarding records.

### Incident Investigation

When a feature flag change correlates with an incident:

1. Filter the audit log by the affected flag key.
2. Identify the last change before the incident start time.
3. Review the diff to understand what changed.
4. Share the audit entry permalink in the incident channel.

### Flag Cleanup

Before archiving or deleting flags, review the audit log to confirm:

- The flag has not been modified recently (it is truly stable).
- No one is still actively managing the flag.
- The last change was a rollout completion, not a rollback.

## Retention

Audit log entries are retained indefinitely on self-hosted installations. Ensure your PostgreSQL instance has adequate storage for long-term audit data.

> **Warning:** The audit log cannot be deleted or modified by any user. This is by design to ensure a tamper-proof history of all changes.

## Next Steps

- Configure [Webhooks](./integrations.md) to forward events to external systems.
- Review [Best Practices](./best-practices.md) for flag cleanup strategies informed by audit data.
