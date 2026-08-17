# CareerForge API Guide

The Spring Boot API runs at `http://localhost:4000/api` when IntelliJ runs `CareerForgeApplication` and XAMPP MySQL is running.

## 1. Check the API

Open this URL in a browser:

```text
http://localhost:4000/api/health
```

It must return `"status":"ok"`. A short machine-readable endpoint list is also available at:

```text
http://localhost:4000/api/docs
```

## 2. Create a student or sign in

Register a student:

```powershell
$body = @{ name = "Student Name"; email = "student@example.com"; password = "StrongPassword1" } | ConvertTo-Json
Invoke-RestMethod http://localhost:4000/api/auth/register -Method Post -ContentType application/json -Body $body
```

Sign in with either a student or administrator account:

```powershell
$body = @{ email = "student@example.com"; password = "StrongPassword1"; role = "student" } | ConvertTo-Json
$session = Invoke-RestMethod http://localhost:4000/api/auth/login -Method Post -ContentType application/json -Body $body
$token = $session.token
```

For an administrator, use `role = "admin"` and the account configured through `ADMIN_EMAIL` and `ADMIN_PASSWORD` in IntelliJ. Never put passwords or the JWT secret in Git.

## 3. Call protected endpoints

Send the JWT as a Bearer token:

```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod http://localhost:4000/api/auth/me -Headers $headers
Invoke-RestMethod http://localhost:4000/api/student/overview -Headers $headers
Invoke-RestMethod http://localhost:4000/api/jobs/recommendations -Headers $headers
```

## 4. Important endpoints

| Method | Path | Account | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a student account |
| POST | `/auth/login` | Public | Receive a JWT session token |
| GET/PATCH | `/auth/me` | Signed in | Read or update the current profile |
| GET | `/student/overview` | Student | Dashboard metrics |
| GET | `/jobs/recommendations` | Student | Job match results |
| POST | `/jobs/{id}/apply` | Student | Submit a job application |
| PATCH | `/jobs/applications/{id}/withdraw` | Student | Withdraw an application |
| GET/POST | `/community/posts` | Signed in | Read or create posts |
| POST | `/community/posts/{id}/like` | Signed in | Toggle a like |
| POST | `/community/posts/{id}/comments` | Signed in | Add a comment |
| GET | `/vault` | Student | Resume versions and document metadata |
| POST | `/vault/documents` | Student | Upload a small PDF/DOC/DOCX as Base64 |
| GET | `/vault/documents/{id}/download` | Student | Download own stored document |
| POST | `/assessment-attempts/assessments/{id}/start` | Student | Begin a server-timed attempt |
| POST | `/assessment-attempts/{id}/answers` | Student | Save one answer |
| POST | `/assessment-attempts/{id}/submit` | Student | Score and submit the attempt |
| GET | `/admin/users` | Admin | Search students |
| POST | `/admin/jobs` | Admin | Create a job |
| POST | `/admin/assessments` | Admin | Create an assessment |
| POST | `/admin/questions` | Admin | Add an assessment question |
| PATCH | `/admin/community/posts/{id}` | Admin | Moderate; `action` and `reason` are required |
| GET/PATCH | `/admin/settings` | Admin | Read or update platform settings |

All paths in the table are relative to `http://localhost:4000/api`.

## 5. Test using the frontend

The React app already calls these endpoints. Keep both processes running:

```powershell
# IntelliJ: run CareerForgeApplication
npm.cmd run dev
```

Open the exact Vite URL printed in the terminal, for example `http://localhost:5174`.
