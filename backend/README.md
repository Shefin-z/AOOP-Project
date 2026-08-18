# CareerForge Spring Boot API

This is the active AOOP implementation of the CareerForge API described in the lab report. The React/Tailwind client calls this Spring Boot service through `/api/*` locally and `VITE_API_URL` after deployment.

## Design

- Java 21, Spring Boot 3, Spring Security, JWT, Spring Data JPA, and MySQL/TiDB.
- `model` holds encapsulated JPA entities and enums; `repository` isolates persistence; `service` owns business rules; `controller` holds thin REST endpoints; `dto` and `exception` hold response and error types.
- Core entities use a shared audited base class. Job scoring uses the Strategy pattern (`JobMatchingStrategy`), allowing an AI-backed strategy to be added without changing controllers.
- Spring Boot is the sole application API. The separate `ai-service/` is an optional Python extension for explainable matching and readiness scoring, as specified in the report.

## Package map

```text
src/main/java/edu/uiu/aoop/careerforge/
├── model/        JPA entities and enums
├── repository/   Spring Data database access
├── service/      business rules and Strategy implementations
│   └── impl/     service implementations
├── controller/   REST API endpoints
├── dto/          API response objects
├── exception/    API exceptions and their handler
├── security/     JWT authentication and authorization
├── config/       Spring configuration
├── design/       small Factory and Builder pattern examples
└── event/        application events (Observer pattern)
```

## Run locally

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Set `MYSQL_*` (or `TIDB_*`), `JWT_SECRET`, and `CLIENT_ORIGIN` in your environment. Apply `database/schema.sql` once to a new database, then set `FLYWAY_ENABLED=true` for later migrations. To create the first administrator, set `ADMIN_NAME`, `ADMIN_EMAIL`, and an 8+ character `ADMIN_PASSWORD` for one startup; remove those values after the account has been created.

## Deploy without Docker

Build with `./mvnw package` (or `mvn package`) and run `java -jar target/careerforge-api-1.0.0.jar`. Deploy this directory to any Java 21 host (for example Render or Railway) with that build and start command. Point the Vercel frontend's `VITE_API_URL` to the resulting public URL plus `/api`, and add the Vercel origin to `CLIENT_ORIGIN`.

## Verify

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```
