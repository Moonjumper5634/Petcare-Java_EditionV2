# PetCARE — City Veterinary Office, Santa Rosa, Laguna

Spring Boot + MySQL back end for the **PetCARE-dev** front end.

## Status

| Phase | State |
|---|---|
| 1. Clean-up, Spring Boot skeleton | Done (you ran it) |
| **2. MySQL database + eligibility engine in Java** | **Done in this zip** — see "What was verified" for exactly how far |
| 3. REST API, real login, role checks | Next |

The front end (`src/main/resources/static`) is **PetCARE-dev, unchanged**. It still keeps its data in the
browser (`localStorage`) until Phase 3 connects it to the API. Phase 2 puts the database underneath, ready for that.

## Run it

You need JDK 17+, Maven, and a running **MySQL 8**. No tables to create by hand.

```powershell
# 1. Be inside the folder that contains pom.xml (check with:  dir pom.xml)
cd C:\path\to\petcare

# 2. Tell the app your MySQL login (this window only; nothing is saved in the project)
$env:PETCARE_DB_USER = "root"
$env:PETCARE_DB_PASSWORD = "your-mysql-password"

# 3. Start. First run creates the `petcare` database, builds the tables and loads demo data.
mvn clean spring-boot:run
```

Then open:

| URL | What you should see |
|---|---|
| http://localhost:8081 | the PetCARE site (login screen) |
| http://localhost:8081/api/dev/db-status | `"status":"Spring Boot is reading MySQL"` and a row count per table |
| http://localhost:8081/api/dev/eligibility/P-1042 | Buddy's decision-tree result for all 3 services (Kapon: `ELIGIBLE`) |
| http://localhost:8081/api/dev/eligibility/P-1047 | Bruno: Kapon is `FOR REVIEW` |
| http://localhost:8081/api/dev/eligibility/P-1046 | Max: Kapon is `NOT ELIGIBLE` (age only) |

In MySQL Workbench: `USE petcare; SHOW TABLES; SELECT id, role, email FROM app_user;`

Run the tests (no database needed): `mvn test`

**Other MySQL setups.** Different port or host: set `PETCARE_DB_URL`
(e.g. `jdbc:mysql://localhost:3307/petcare?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true`).
Different web port: `$env:PORT = "8082"`. XAMPP/MariaDB is not what this was set up and tested against for the driver —
if you use it, tell me and I'll switch the driver and URL.

## Test accounts (dev profile only)

| Role | Email | Password |
|---|---|---|
| Resident | `resident@petcare.local` | `Resident#2026` |
| CVO Staff | `staff@petcare.local` | `Staff#2026` |
| Administrator | `admin@petcare.local` | `Admin#2026` |

Other seeded accounts use `Petcare#2026`. In the database they are **bcrypt hashes**; the plaintext exists only here.
These work in the browser today because the front end still checks its own local copy; Phase 3 makes the server check them.

## Profiles

| | `dev` (default) | `prod` (`SPRING_PROFILES_ACTIVE=prod`) |
|---|---|---|
| Schema + reference data (V1, V2) | yes | yes |
| Demo accounts, pets, requests (V3) | yes | **no** |
| `/api/dev/*` endpoints | yes | **no** |
| "Today" | fixed 17 Aug 2026 (same as the front end, keeps seeded results stable) | real date, Asia/Manila |

## Database

Flyway builds it from `src/main/resources/db/migration` (V1 schema, V2 reference data) and, in `dev`,
`db/seed-demo` (V3). Hibernate runs with `ddl-auto=validate`: it never changes tables, it only refuses to start if the
Java entities and the tables disagree. **Never edit an applied migration; add `V4__...sql` instead.**

```
app_user ──< pet ──< pet_registration
   │          └────< service_request ──1 eligibility_assessment ──< eligibility_assessment_criterion
   │                       │  └──────1 service_record
   │                       └── veterinary_service ──< eligibility_criterion
   ├──< adoption_application ──1 adoption_interview      shelter_pet ──< adoption_application
   ├──< notification
   └──< audit_log (user_id nullable)                     id_sequence (P-1050, REQ-3303, ...)
```

Design choices, all taken from the front end so nothing has to change when Phase 3 connects it:

- **Ids keep the front end's format** (`U-1001`, `P-1042`, `REQ-3301`, ...). `IdGenerator` hands out the next one
  from `id_sequence` under a row lock, like the front end's `nextId()`.
- **Roles** are `owner` (shown as "Resident"), `staff`, `admin`. **Statuses** are the exact strings the UI uses,
  enforced by CHECK constraints.
- **The system's classification and the staff's decision stay separate**: `eligibility_assessment.classification`
  vs `service_request.staff_decision`.
- The decision-tree **path is not stored**: the UI redraws it from the criteria rows plus the classification.
- Entities use plain foreign-key id fields (`ownerId`), not object links, to stay simple. Add links in Phase 3 where a screen needs them.
- **Not modelled on purpose:** System Settings (organisation details, notification toggles). The front end never saves them.

## Eligibility engine (Java)

`eligibility/EligibilityEngine.java` is a line-by-line port of the front end's decision tree. Plain Java, no Spring.

**One deliberate change:** in the front end, the Administrator's *Enable/Disable criterion* switch did nothing; the
rules were hard-coded. Here the engine only evaluates criteria that are enabled in `eligibility_criterion`.
With everything enabled, results are identical to the front end. Safety rules for the new behaviour:
all criteria disabled → `FOR REVIEW` (never auto-approve); a criterion with no coded rule → `REVIEW`.
The numeric thresholds themselves (3 months, 6 months, 5–48 months, 3 kg, 12 months) are still in code.

## What was verified (and what was not)

Verified, in the build environment:

- **SQL**: V1+V2+V3 applied to a real MariaDB 10.11 server. Row counts match the front end's seed data (7 users,
  7 pets, 2 requests, 15 criteria, ...). 11 deliberate bad writes (duplicate email in other case, bad status, unknown
  service, deleting a user who owns pets, ...) were all rejected.
- **Engine**: 151 JUnit tests pass, including **144 cases checked against the front end's own JavaScript engine**
  (every criterion's label, value, result and basis, plus the classification). Breaking a rule on purpose (3 kg → 4 kg,
  12 → 11 months) makes the suite fail, so it does guard the rules.
- **Java compiles** cleanly (`-Xlint:all`) against stand-ins for the Spring and JPA annotations.
- **Entities vs tables**: all 151 mapped columns checked against the live schema (existence, type, length,
  nullability); no column left unmapped; every repository query method resolves to a real field.
- **Front end** boots from `static/` with 0 script errors; all three roles log in and every screen renders.

**Not verified:** the real Spring Boot start-up against MySQL. The sandbox could not download Spring/Hibernate/Flyway
or run MySQL 8 itself, so the first `mvn spring-boot:run` on your machine is the real test. If it fails, the console
message (Flyway, Hibernate `validate`, or a connection error) will say which part; send it to me.

## Regenerating the seed data

The V2/V3 SQL and `src/test/resources/eligibility-golden.json` are **generated from the front end's own files**
(needs Node.js):

```powershell
cd tools
npm install
node generate-seed.js C:\path\to\PetCARE-dev
```

Re-run it if the front end's seed data or eligibility rules change, then run `mvn test`: a failing parity test means
the Java engine and the JavaScript engine have drifted apart.

## Findings carried forward

1. **Front-end date bug (Philippine time):** `todayISO()` in `utils/formatting.js` builds "today" at local midnight and
   converts it with `toISOString()`, which shifts to UTC. In a Manila browser the fixed demo date comes out as
   `2026-08-16` instead of `2026-08-17`. It affects dates the UI records, not the eligibility results. The Java side does not have this problem.
2. Passwords and the `123456` verification code are still checked in the browser (`devCredentials.js`). Phase 3 moves this to the server.
3. All authorisation is still client-side. Phase 3 must enforce roles on every API endpoint.
4. Kapon minimum weight (3 kg), age range (5 months–4 years) and the 12-month rabies interval are labelled "sample"
   in the code. Confirm them with the CVO.
5. The Digital Pet ID QR payload is a plain-text snapshot, not a server-verified token (noted in `petQr.js`).
6. Pet photos and the login images are Unsplash links; the CVO needs its own.
7. Under the Philippine Data Privacy Act, a real deployment needs a consent notice and a retention policy.

## Layout

```
pom.xml
src/main/java/ph/gov/santarosa/petcare/
  PetCareApplication.java
  domain/       15 JPA entities (one per table)
  repository/   Spring Data repositories
  eligibility/  EligibilityEngine (pure Java), EligibilityService (reads MySQL)
  service/      IdGenerator
  config/       ClockConfig
  web/          DevStatusController (dev profile only)
src/main/resources/
  application.properties, application-dev.properties, application-prod.properties
  db/migration/   V1__schema.sql, V2__reference_data.sql
  db/seed-demo/   V3__demo_seed.sql
  static/         the PetCARE-dev front end
src/test/         engine parity + behaviour tests, golden file
tools/            generate-seed.js
```
