# Users & Roles

**можно**<span class=brand-dot>.</span> supports team collaboration with three access roles. Each user has their own account; invitations are sent via the web dashboard.

## Roles

| Role | Permissions |
|------|------------|
| **ADMIN** | Full access: manage users, projects, environments, API keys. Create and modify flags, segments, activation rules. |
| **DEVELOPER** | Manage flags, segments, activation rules, tags. View audit log. Cannot manage users and API keys. |
| **VIEWER** | Read-only: view flags, segments, audit log. Cannot make changes. |

Role hierarchy: `ADMIN` includes `DEVELOPER` permissions, `DEVELOPER` includes `VIEWER` permissions.

## Inviting a User

The first administrator is created on initial setup via the onboarding wizard. Subsequent users are invited through the web dashboard:

1. Go to the **Users** section (ADMIN only)
2. Click **Invite**
3. Enter email and role
4. The user receives an email with an activation link, sets their name and password

The name is not specified at invitation — the user sets it themselves upon account activation.

## Password Recovery

1. User clicks **"Forgot Password"** on the login page
2. Server sends an email with a reset link
3. User sets a new password via the link

## User Management (ADMIN)

Administrators can view the user list, change roles, and delete accounts through the **Users** section in the web dashboard. User email and name are immutable — they are set upon account activation.

## User Profile

Each user has a profile with the following data:

| Field | Description |
|-------|-------------|
| `email` | Email (login) |
| `name` | Display name |
| `role` | Role: ADMIN, DEVELOPER, VIEWER |
| `status` | ACTIVE, INACTIVE |
| `locale` | Interface language: `en` or `ru` |
| `avatar` | Avatar (image) |

## Activity Audit

All user actions are recorded in the [audit log](/en/guide/audit): flag creation and modification, invitations, API key management, settings changes. The audit log is accessible to all three roles.

## Related Pages

- [Audit](/en/guide/audit) — tracking changes
- [Security](/en/advanced/security) — JWT, refresh tokens, rate limiting
- [Configuration](/en/intro/configuration) — SMTP for emails
