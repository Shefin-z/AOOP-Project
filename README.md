# CareerForge

CareerForge is a full-stack AI career-development platform for university students. The project includes a premium, responsive glassmorphism UI and separate Student and Admin experiences.

## Technology

- Frontend: React 19, Vite 7, Tailwind CSS, Lucide icons
- Backend: Node.js, Express, JWT authentication, bcrypt, MySQL2
- Data: MySQL 8.4 with normalized schema and seed data
- AI: Gemini API adaptive skill assessments plus Python 3.12+/FastAPI job matching, career-readiness scoring, skill-gap analytics, and cover-letter generation
- Delivery: Docker Compose and ChatGPT Sites configuration

## Included experiences

- Landing page and separate Student/Admin sign-in
- Student dashboard, personalized jobs, application tracking, AI cover letters, Resume/Career Vault, assessments, analytics, learning, community, events, achievements, and profile management
- Admin overview, user management, assessments, question bank, resources, events, jobs, community moderation, application funnel, performance monitoring, and system settings
- Responsive mobile navigation, modals, filters, search, quiz state, reports, CRUD interactions, file selectors, toast feedback, and print-to-PDF resume export

## Quick start with Docker

```bash
docker compose up --build
```

Open:

- Web: `http://localhost:3000`
- Express API: `http://localhost:4000/api/health`
- Python AI docs: `http://localhost:8000/docs`
- MySQL: `localhost:3306`

The first MySQL startup automatically applies `database/schema.sql` and `database/seed.sql`.

## Manual development

```bash
npm install
copy .env.example .env
npm run dev:all
```

Run the Python service in another terminal:

```bash
python -m pip install -r ai-service/requirements.txt
python -m uvicorn main:app --app-dir ai-service --reload --port 8000
```

MySQL must be available using the connection settings in `.env`.

## Gemini adaptive skill assessments

Student skill journeys contain 10 progressively harder levels with 6 personalized
questions per level. Before starting, students must save their university, degree,
graduation year, target role, location and at least one career interest. Only the
degree, target role and career interests are sent to Gemini; account identity and
contact details are not included in the generation prompt.

Add the API key only to the server environment:

```bash
GEMINI_API_KEY=your-private-key
GEMINI_MODEL=gemini-3.6-flash
```

Never use a `VITE_` prefix for this key or commit it to the repository.

### Student email verification

Student signup uses a two-step email verification flow. The server sends a
six-digit code, stores only its HMAC hash, expires it after 10 minutes and
creates the student account only after a successful verification.

Without buying a domain, Gmail can deliver the codes using a Google App
Password. Enable 2-Step Verification on the sender account and add these
server-only environment variables:

```bash
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-google-app-password
EMAIL_FROM=CareerForge <your-email@gmail.com>
EMAIL_VERIFICATION_SECRET=your-independent-long-random-secret
```

`EMAIL_PROVIDER=resend` with `RESEND_API_KEY` and a verified `EMAIL_FROM`
domain remains supported as an alternative. For local development,
`EMAIL_DELIVERY_MODE=console` prints the code only in the API terminal when no
provider is configured. Hosted production never permits the console fallback.
Never expose any of these values with a `VITE_` prefix.

## Authentication setup

No account credentials are committed or prefilled. Students create an account and
then sign in with their own email and password. Production authentication requires
the Express API and MySQL connection configured through environment variables.

Create the private administrator after applying the database schema:

```bash
set ADMIN_NAME=Your Name
set ADMIN_EMAIL=your-private-admin@example.com
set ADMIN_PASSWORD=use-a-long-private-password
npm run admin:create
```

Use the equivalent environment-variable syntax for your shell. Never commit the
real administrator values.

For Vercel production, connect a TiDB Cloud cluster to the project so the
`TIDB_*` connection variables are injected, add a long random `JWT_SECRET`, and
then initialize the remote database:

```bash
npm run db:setup
npm run admin:create
```

The Vercel function in `api/index.js` serves the Express API on the same origin
as the frontend.

## Verification commands

```bash
npm run build
npm run test:adaptive-assessment
npm run test:adaptive-ui
npm audit --omit=dev
node --check server/src/app.js
python -m py_compile ai-service/main.py
python -m pip check
```
