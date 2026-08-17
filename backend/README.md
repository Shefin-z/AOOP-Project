# CareerForge Spring Boot API

This is the AOOP implementation of the CareerForge API described in the lab report. The React/Tailwind client stays unchanged; it continues to call `/api/*`.

## Design

- Java 21, Spring Boot 3, Spring Security, JWT, Spring Data JPA, and MySQL/TiDB.
- `domain` holds encapsulated JPA entities and enums; `repository` isolates persistence; `service` owns business rules; `web` holds thin REST controllers and safe error responses.
- Core entities use a shared audited base class. Job scoring uses the Strategy pattern (`JobMatchingStrategy`), allowing an AI-backed strategy to be added without changing controllers.
- The Vercel deployment uses the Express API in `server/` because Vercel runs the
  React client and Node API together. This Spring project remains the AOOP
  reference implementation and can be deployed separately to a Java host.

## Run locally

```powershell
cd backend
mvn spring-boot:run
```

Set `MYSQL_*` (or `TIDB_*`) and `JWT_SECRET` in the parent `.env` or your environment. The existing `database/schema.sql` is the database contract. Create the administrator using the documented SQL/admin process before signing in.

## Verify

```powershell
mvn test
mvn package
```
