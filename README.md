# Agradhi Media Unit Portal

## Local JSON database

The server stores competitions, school accounts, and submissions in `data/db.json`. If an existing database does not yet have a competitions list, the app seeds it with the built-in competition catalogue on its next read. Admin competition creation, edits, deletion, school status changes, and submission status, score, and feedback updates are persisted there. Competitions with submissions cannot be deleted, so historical entries remain intact. Keep this file out of public/static directories and restrict access to the operating-system account running the app. The app validates the complete database before reads and writes, caps its size, hashes new school passwords, and uses a private temporary file plus an atomic replacement when saving. Back up the file securely; this JSON store is intended for a single application instance and does not replace a transactional database for concurrent or high-volume production use.

Invalid request bodies, unsupported fields, out-of-range values, malformed stored records, duplicate identifiers/emails, and invalid submission references are rejected rather than coerced or silently replaced with empty data.

Competition applications are submitted by an active school account. The `/apply` page now uses the persisted open competition catalogue and the same validated submission form as the school dashboard; unauthenticated visitors are directed to school sign-in instead of receiving a false success message.

## Authentication setup

Copy `.env.example` to `.env.local` and configure a unique admin email/password and a random `SESSION_SECRET` of at least 32 characters. Generate a secret with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Keep `.env.local` private and use the same stable secret on all app instances. Production requires HTTPS for secure session cookies. Newly registered schools need a password of at least 12 characters.
