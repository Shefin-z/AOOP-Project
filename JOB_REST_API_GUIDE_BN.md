# CareerForge Job REST API — স্যারকে বোঝানোর গাইড

এই file-টি `Start-CareerForge.bat`-এর পাশেই রাখা হয়েছে। এখানে CareerForge-এ external source থেকে job আনা, validate করা, database-এ রাখা এবং student-কে দেখানোর সম্পূর্ণ REST API flow লেখা আছে।

## ৩০ সেকেন্ডে বলার মতো উত্তর

> আমি Spring Boot দিয়ে নিজের Job REST API তৈরি করেছি। React frontend সরাসরি BDJobs বা অন্য provider-কে call করে না; এটি আমার backend-এর `/api/admin/jobs/sync` endpoint-এ request পাঠায়। Backend আগে admin যাচাই করে, তারপর Java `HttpClient` দিয়ে external job API call করে। পাওয়া JSON data validate ও normalize করে, duplicate check করে MySQL database-এ JPA দিয়ে save করে। Valid job student-এর জন্য publish হয়, আর incomplete বা suspicious job admin review-এর জন্য draft থাকে। Student side আবার আমার `/api/jobs` বা `/api/jobs/matches` endpoint থেকে data পায়।

## Overall architecture

```text
Admin dashboard (React)
        |
        | POST /api/admin/jobs/sync?source=bdjobs
        | X-User-Id: admin id
        v
JobController  -->  AccessService (admin validation)
        |
        v
JobService + JobSourceAdapter
        |
        v
BdJobsSource / RemotiveJobImportProvider
        |
        | Java HttpClient GET request
        v
External job REST API (BDJobs / Remotive / optional JSearch)
        |
        | JSON response
        v
Validation + normalization + duplicate check
        |
        v
Spring Data JPA --> MySQL (companies, jobs)
        |
        +--> valid job: published
        +--> incomplete/suspicious job: draft / needs_review
        |
        v
Student React UI --> GET /api/jobs or GET /api/jobs/matches
```

## আমার নিজের REST API endpoints

Backend URL base: `http://localhost:4000/api`  
(`application.yml`-এ port `4000` এবং context path `/api` রাখা আছে।)

| Method | Endpoint | কাজ | কার জন্য |
| --- | --- | --- | --- |
| `GET` | `/api/jobs` | শুধু published ও non-expired job list দেয় | Student / public UI |
| `GET` | `/api/jobs/matches` | student profile ও default CV অনুযায়ী matched job দেয় | Student |
| `GET` | `/api/jobs/matches?query=java&location=dhaka` | search/filter করা job দেয় | Student |
| `GET` | `/api/admin/jobs` | সব job, draft/published/closed সহ list দেয় | Admin |
| `POST` | `/api/admin/jobs` | manually একটি job তৈরি করে | Admin |
| `PUT` | `/api/admin/jobs/{jobId}` | job update করে | Admin |
| `DELETE` | `/api/admin/jobs/{jobId}` | job delete করে | Admin |
| `POST` | `/api/admin/jobs/import` | Remotive/JSearch source থেকে import চালায় | Admin |
| `POST` | `/api/admin/jobs/sync?source=bdjobs` | BDJobs source থেকে sync চালায় | Admin |
| `POST` | `/api/admin/jobs/sync?source=all` | সব configured source sync চালায় | Admin |
| `GET` | `/api/admin/jobs/sync/status?source=bdjobs` | import/sync status, new/published/review count দেয় | Admin |

Admin endpoints-এর request-এ project-এর current session identity হিসেবে `X-User-Id` header যায়। Backend-এর `AccessService.requireAdmin(...)` নিশ্চিত করে যে সেটি admin user।

## Admin button click থেকে job আসার flow

`frontend/src/App.jsx`-এ Admin Jobs page-এর `syncSource(source)` function এই request দেয়:

```js
fetch(`${API_BASE_URL}/admin/jobs/sync?source=${source}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-User-Id": current.id
  }
});
```

যখন admin **Sync BDJobs** চাপেন:

1. React `POST /api/admin/jobs/sync?source=bdjobs` পাঠায়।
2. `JobController.syncJobs(...)` request নেয়।
3. `requireAdmin(id)` দিয়ে admin role যাচাই হয়।
4. `JobSourceAdapter` list থেকে `bdjobs` source বের করা হয়।
5. `JobService.importFromProvider(...)` source-এর `importJobs()` চালায়।
6. নতুন record কয়টি import হলো এবং validation outcome কী—তা response-এ ফেরত যায়।
7. Frontend `GET /api/admin/jobs` আবার call করে updated list দেখায়।

## External REST API call কীভাবে করছি

### 1. BDJobs source

Code file: `src/main/java/edu/uiu/aoop/careerforge/service/BdJobsSource.java`

এই service Java 17-এর built-in `HttpClient` দিয়ে BDJobs public JSON endpoint-এ `GET` request পাঠায়।

```java
HttpRequest request = HttpRequest.newBuilder(URI.create(apiEndpoint + "?" + query))
    .timeout(Duration.ofSeconds(20))
    .header("Accept", "application/json")
    .header("User-Agent", "CareerForge-AOOP-Project/1.0")
    .GET().build();

HttpResponse<String> response = client.send(
    request, HttpResponse.BodyHandlers.ofString());
```

- Primary source: `https://api.bdjobs.com/Jobs/api/JobSearch/GetJobSearch`
- প্রথমে JSON API থেকে সর্বোচ্চ দুই page (প্রতি page-এ up to 50 listing) নেয়।
- API unavailable হলে public listing page-এর embedded `ng-state` JSON parse করে fallback দেয়।
- HTTP status 2xx না হলে বা unexpected JSON এলে backend `502 Bad Gateway` error দেয়।

### 2. Remotive / JSearch source

Code file: `src/main/java/edu/uiu/aoop/careerforge/service/RemotiveJobImportProvider.java`

- `POST /api/admin/jobs/import` default ভাবে Remotive remote-job API call করে।
- `.env`-এ `RAPIDAPI_KEY` থাকলে optional JSearch/RapidAPI source ব্যবহার করা হয়।
- API key শুধু backend environment-এ থাকে; frontend-এ পাঠানো হয় না।

## Raw data safe করার জন্য যা করেছি

External API থেকে পাওয়া data blindly publish করি না। `BdJobsSource.save(...)`-এ নিচের checks আছে:

1. `externalId`, title, company name, এবং future deadline না থাকলে record বাদ যায়।
2. `(source, externalId)` দিয়ে `JobRepository.findBySourceAndExternalId(...)` duplicate check হয়। একই job আবার sync করলে নতুন duplicate row তৈরি হয় না।
3. Description থেকে HTML tag remove করে clean text রাখা হয়।
4. Job type ও workplace থেকে internal format করা হয়: `internship`, `part_time`, `full_time`, `contract`; এবং `onsite`, `hybrid`, `remote`।
5. Title, company, location, description ও deadline quality gate pass করলে `published` হয়।
6. কোনো গুরুত্বপূর্ণ field missing, description খুব ছোট, বা company name confidential/undisclosed হলে `draft` + `needs_review` হয়। Admin তখন review করে publish করতে পারেন।
7. আগে admin যে job `closed` করেছে, import সেটিকে আবার publish করে না।
8. `JobService.closeExpiredJobs()` expired job-কে `closed` করে দেয়, তাই student expired job দেখতে পায় না।

## Automatic refresh এবং manual refresh

- `JOB_SYNC_ENABLED=true` থাকলে `JobSyncScheduler` প্রতি ৬ ঘণ্টায় background-এ **BDJobs** sync করে। না থাকলে admin-এর existing manual sync-ই ব্যবহার হয়।
- Remotive/JSearch scheduler-এ hourly call হয় না, কারণ তাদের provider rate limit tighter; admin চাইলে manual import চালাতে পারেন।
- Student Jobs page open হলে latest match load হয় এবং page খোলা থাকলে প্রতি ১ ঘণ্টায় database থেকে আবার match load হয়।
- **Refresh matches** button external provider-কে call করে না; এটি শুধু database থেকে latest profile-matched result আবার আনে। তাই কোনো admin sync বা hourly sync-এর পরে নতুন job থাকলে সঙ্গে সঙ্গে দেখা যায়।

## Database-এ কীভাবে save হচ্ছে

```text
External JSON
  -> Jackson ObjectMapper দিয়ে parse
  -> Job entity ও Company entity map
  -> Spring Data JPA Repository
  -> MySQL database
```

Relevant files:

- `model/Job.java` — `jobs` table-এর entity
- `model/Company.java` — company data
- `repository/JobRepository.java` — JPA query ও duplicate lookup
- `service/JobService.java` — manual CRUD, expiry closing, DTO response
- `service/BdJobsSource.java` — BDJobs import, validation, status decision
- `service/RemotiveJobImportProvider.java` — Remotive/JSearch import

`BdJobsSource` এবং `RemotiveJobImportProvider`-এ `@Transactional` আছে। অর্থাৎ import operation database transaction-এর মধ্যে হয়।

## Student-এর কাছে job কীভাবে যায়

Student job list page থেকে frontend call করে:

```js
fetch(`${API_BASE_URL}/jobs/matches`, { headers });
```

`JobController.matches(...)` তারপর `JobDiscoveryService.discover(...)` চালায়। এটি:

- শুধু `published` ও non-expired job নেয়;
- student profile, skills, target role, location এবং default CV বিবেচনা করে;
- role, experience, skills, location, freshness score দিয়ে match করে;
- optional semantic embedding থাকলে hybrid match score দেয়;
- match percentage ও matched skills সহ JSON response দেয়।

এজন্য project-এ শুধু external job import না, imported job student-এর জন্য personalisedভাবে show-ও করা হয়।

## API response-এর উদাহরণ

### Sync request

```http
POST http://localhost:4000/api/admin/jobs/sync?source=bdjobs
X-User-Id: <admin-user-id>
```

### Sync response (example)

```json
{
  "source": "BDJobs",
  "status": "success",
  "newJobs": 12,
  "totalJobs": 3804,
  "publishedJobs": 3790,
  "needsReviewJobs": 14,
  "error": "",
  "imported": 12
}
```

### Student jobs request

```http
GET http://localhost:4000/api/jobs/matches?query=java&location=dhaka
X-User-Id: <student-user-id>
```

## Sir জিজ্ঞেস করলে গুরুত্বপূর্ণ কথা

### “এটি কেন REST API?”

কারণ frontend ও backend HTTP method (`GET`, `POST`, `PUT`, `DELETE`) এবং resource-based URL দিয়ে communicate করছে। Response JSON format-এ যাচ্ছে; frontend database বা BDJobs-কে direct access করছে না।

### “External API কেন frontend থেকে call করো নি?”

Backend থেকে call করার ফলে API key client-এ expose হয় না, validation ও duplicate prevention এক জায়গায় থাকে, এবং provider error handle করা যায়।

### “Duplicate কীভাবে ঠেকাও?”

প্রতিটি imported job-এর `source` এবং provider-এর `externalId` database-এ রাখা হয়। আবার import হলে ওই pair দিয়ে existing job খুঁজে update করা হয়; নতুন row তৈরি হয় না।

### “Invalid job কেন student দেখতে পায় না?”

Incomplete বা suspicious job `draft`/`needs_review` থাকে। Student API শুধু `published` এবং unexpired job query করে।

### “Production-এ authentication কী হবে?”

বর্তমান academic project-এ session user id `X-User-Id` header দিয়ে role check করা হয়েছে। Production deployment-এ এই header-এর বদলে signed JWT/session cookie ও Spring Security ব্যবহার করা উচিত।

## Demo দেওয়ার সহজ sequence

1. `Start-CareerForge.bat` চালাও।
2. Admin account দিয়ে login করো।
3. **Admin → Jobs** page খোলো।
4. **Sync BDJobs** চাপো।
5. Notice-এ new, published, এবং needs-review job count দেখাও।
6. Draft/needs-review section দেখাও—এটাই validation কাজ করছে তার প্রমাণ।
7. Student account দিয়ে login করো।
8. **Student → Jobs** page-এ গিয়ে profile-based matched job এবং filter search দেখাও।

## Short file map

| কাজ | File |
| --- | --- |
| REST endpoints | `controller/JobController.java` |
| External BDJobs REST call | `service/BdJobsSource.java` |
| External Remotive/JSearch REST call | `service/RemotiveJobImportProvider.java` |
| Admin CRUD + job list | `service/JobService.java` |
| Student matching | `service/JobDiscoveryService.java` |
| DB access + duplicate lookup | `repository/JobRepository.java` |
| Admin frontend calls | `frontend/src/App.jsx` |
| API URL, DB, provider config | `src/main/resources/application.yml` |
