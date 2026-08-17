# CareerForge

CareerForge is a React and Express career-development platform for university
students. It provides separate student and administrator workspaces, job
matching, assessments, learning resources, events, community features, and
profile management.

## Stack

- Frontend: React 19, Vite 7, Tailwind CSS, Lucide
- API: Express, JWT, MySQL/TiDB
- Optional integrations: Gemini assessments and email verification

The Vercel deployment serves the Vite frontend and the Express API from the
same domain. Frontend calls use `/api`, so there is no production CORS setup or
hard-coded localhost URL to maintain. The Spring Boot project in `backend/` is
kept as the AOOP reference implementation; it is not the API deployed by this
Vercel configuration.

## Run locally

Prerequisites: Node.js 20+, npm, and a running MySQL-compatible database.

```powershell
npm install
Copy-Item .env.example .env
npm run db:setup
npm run admin:create
npm run dev:all
```

Open `http://localhost:5173`. Vite forwards `/api/*` to the local Express API
at port 4000, so the browser and API follow the same route shape used in
production.

Configure the database and secrets in `.env`; never commit that file. For local
email testing, leave `EMAIL_DELIVERY_MODE=console` and read the verification
code from the API terminal.

## Deploy on Vercel

1. Push this repository to GitHub and import it into Vercel.
2. Select the repository root as the Vercel root directory. Vercel detects
   Vite; the checked-in configuration runs `npm run build` and publishes
   `dist/client`.
3. Add production environment variables: `JWT_SECRET`, the `MYSQL_*` or
   `TIDB_*` database variables, and any email/Gemini variables you enable.
4. Deploy, then open `/api/health` on the deployment URL. It should return a
   JSON health response before users sign in.

Do not set `VITE_API_URL` for the all-in-one Vercel deployment. If the Express
API is hosted elsewhere, set it to that API base URL ending in `/api` and add
the deployed frontend URL to `CLIENT_ORIGIN` on that API host.

The SPA rewrite intentionally excludes `/api/*`; otherwise Vercel would return
`index.html` to login requests instead of the Express function.

## Useful commands

```powershell
npm run dev          # frontend only
npm run dev:api      # Express API only
npm run dev:all      # frontend and API
npm run build        # production frontend build
npm run test:navigation
```

## Security notes

- Use a long, unique `JWT_SECRET` in every deployed environment.
- Keep all credentials in Vercel environment variables or `.env`, never in Git.
- Create the private administrator with `npm run admin:create` after the
  production database is initialized.
