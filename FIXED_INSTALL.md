# Fixed installation

This version removes `better-sqlite3`, the native dependency that caused installation to fail on Node.js v24.

In the project folder run:

    npm.cmd install
    npm.cmd start

Then open http://localhost:3000

The starter now stores development data in `data/db.json`. This is for local development only. Before production, replace it with PostgreSQL or another production database and move secrets to environment variables.
