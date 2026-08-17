# CareerForge

CareerForge is a React and Spring Boot career-development platform for university
students. It implements the AOOP lab-report requirements: separate student and
administrator workspaces, persistent profiles and Career Vaults, job matching,
assessments, learning resources, events, community features, achievements and
role-based security.

## Stack

- Frontend: React 19, Vite 7, Tailwind CSS, Lucide
- API: Java 21, Spring Boot, Spring Security/JWT, JPA/JDBC, MySQL/TiDB
- Optional AI extension: Python FastAPI service for explainable matching and readiness scoring

Vercel hosts the Vite frontend. Spring Boot is deployed separately on a Java 21
host; production frontend calls use `VITE_API_URL` and the backend's
`CLIENT_ORIGIN` allow-list protects cross-origin access. No Docker or Node API
is required.

## Run locally

Prerequisites: Node.js 20+, npm, Java 21, Maven, and a running MySQL-compatible database.

```powershell
npm install
# Apply database/schema.sql to a new MySQL/TiDB database.
$env:JWT_SECRET="use-a-long-random-secret"
$env:ADMIN_NAME="CareerForge Admin"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="replace-with-a-strong-password"
npm run dev:all
```

Open `http://localhost:5173`. Vite forwards `/api/*` to Spring Boot at port
4000. The browser never reloads to navigate between login, student and admin
views; routing is handled in-app.

Configure database variables, `JWT_SECRET`, and `CLIENT_ORIGIN` in `.env` or the
host environment; never commit those secrets. Use `ADMIN_NAME`, `ADMIN_EMAIL`,
and `ADMIN_PASSWORD` for only the first Spring Boot start to create the private
administrator, then remove them.

## Deploy on Vercel

1. Push this repository to GitHub and import it into Vercel.
2. Select the repository root as the Vercel root directory. Vercel detects
   Vite; the checked-in configuration runs `npm run build` and publishes
   `dist/client`.
3. Deploy `backend/` to a Java 21 host with build command `mvn package` and
   start command `java -jar target/careerforge-api-1.0.0.jar`. Add `MYSQL_*` or
   `TIDB_*`, `JWT_SECRET`, and `CLIENT_ORIGIN=https://your-vercel-domain` there.
4. In Vercel, add `VITE_API_URL=https://your-spring-api-domain/api`, then deploy.
   Open `https://your-spring-api-domain/api/health` before users sign in.

`VITE_API_URL` is required in Vercel and must end in `/api`. Locally, leave it
unset and Vite will proxy `/api` to the Spring service.

## Useful commands

```powershell
npm run dev          # frontend only
npm run dev:api      # Spring Boot API only
npm run dev:all      # frontend and API
npm run build        # production frontend build
npm run test:navigation
```

## Security notes

- Use a long, unique `JWT_SECRET` in every deployed environment.
- Keep all credentials in Vercel/backend-host environment variables or `.env`, never in Git.
- Create the private administrator directly in the initialized database and store a BCrypt password hash.
