# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report privately via
[GitHub Security Advisories](https://github.com/smadrom/basalt/security/advisories/new).
You can expect an acknowledgement within a few days.

## Scope

Basalt is a starter template. The most security-relevant areas are:

- **Auth** (`apps/api/src/auth`) — Better Auth configuration, bearer-token handling.
- **Database access** (`apps/api/src/db`, route handlers) — query construction.
- **Secrets** — never commit a real `.env`; `.env.example` holds placeholders only.

When you fork this base for a real project, rotate `BETTER_AUTH_SECRET` and all
database credentials before deploying.
