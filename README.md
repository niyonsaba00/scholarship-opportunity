# Scholarship Opportunity — Full-Stack Starter

This project expands the original front-end prototype into a serious production-ready foundation.

## Included
### Public platform
- Scholarship discovery/search
- Filters: degree level, funding, country, field
- Deadline sorting and deadline tracker
- Save/shortlist UI
- Application guides
- Scam-awareness content
- Scholarship alerts/newsletter UI
- Responsive mobile design

### Backend foundation
- Node.js + Express API
- SQLite database
- Scholarship CRUD API
- User registration/login API
- Saved-scholarship API
- Application-tracking API
- Newsletter subscription API
- Admin verification/status fields
- Seed data

### Admin foundation
The API supports the workflow an admin dashboard needs:
- create scholarships
- edit scholarships
- publish/unpublish
- verification status
- manage deadlines
- track source URLs

## Run locally
Requirements: Node.js 18+

1. Open a terminal in this folder.
2. Run:
   npm install
3. Run:
   npm start
4. Open:
   http://localhost:3000

The first run creates `data/scholarship.db` and seeds sample records.

## Demo admin API
The starter deliberately does NOT include a hard-coded admin password or fake production security.

Before deployment, implement:
- secure password hashing
- session/JWT strategy
- role-based access control
- email verification
- password reset
- CSRF/rate-limit protections
- validation and sanitization
- audit logs
- secure secrets/environment variables

## Production architecture
Frontend → API → PostgreSQL → background jobs → email/SMS provider

Recommended next build:
1. Replace SQLite with PostgreSQL.
2. Add a real admin dashboard.
3. Add authentication/authorization.
4. Add scholarship submission + verification workflow.
5. Add automated alerts.
6. Add application tracker.
7. Add analytics.
8. Add privacy/terms/consent flows.
9. Deploy frontend + API with HTTPS.
10. Add backups, monitoring and error logging.

## Critical trust rule
A scholarship should never be labeled "verified" merely because it appears in the database. Verification should mean a human or trusted verification process checked the official provider/source, eligibility, deadline and application route.
