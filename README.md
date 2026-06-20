# Success Day

Success Day is a minimal HR source application for IAM and IGA labs. It provides Keycloak login, employee management, a SQLite-backed HR database, and a small SCIM 2.0 Users API.

## Start The Lab

Run:

```bash
./start.sh
```

Or:

```bash
docker compose up --build
```

This starts:

- Success Day at `http://localhost:3000`
- Keycloak at `http://localhost:8080`
- Postgres for Keycloak
- SQLite for Success Day in the `success_day_data` Docker volume

The app uses `KEYCLOAK_ISSUER` for browser-facing redirects and `KEYCLOAK_INTERNAL_ISSUER` for container-to-container OIDC calls.

The HR database starts empty.

## Default URLs

- Success Day App: `http://localhost:3000`
- Login Page: `http://localhost:3000/login`
- Employees Page: `http://localhost:3000/employees`
- Keycloak Admin Console: `http://localhost:8080`
- SCIM Base URL: `http://localhost:3000/api/scim/v2`
- SCIM Users Endpoint: `http://localhost:3000/api/scim/v2/Users`

## Credentials

Keycloak admin console:

```txt
Username: admin
Password: admin
```

Success Day app login:

```txt
Username: admin@successday.local
Password: Admin123!
```

SCIM API:

```txt
Bearer Token: dev-scim-token
```

## Employee Management

After logging in, use `/employees` to list employees, add a new employee, or edit an existing employee.

Deleting an employee through the REST API does not hard-delete the record. It sets the employee status to `TERMINATED`.

## Optional Employee Import

Sample files are provided in `samples/employees.csv` and `samples/employees.json`.

Import CSV:

```bash
docker compose exec success-day-web npm run import:employees -- /app/samples/employees.csv
```

Import JSON:

```bash
docker compose exec success-day-web npm run import:employees -- /app/samples/employees.json
```

Imports upsert employees by `employeeId`.

## REST API Examples

List employees:

```bash
curl http://localhost:3000/api/employees
```

Create an employee:

```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "E1004",
    "firstName": "Jordan",
    "lastName": "Taylor",
    "email": "jordan.taylor@example.com",
    "username": "jordan.taylor",
    "department": "Security",
    "jobTitle": "Security Engineer",
    "managerEmail": "manager@example.com",
    "employmentType": "FULL_TIME",
    "status": "ACTIVE",
    "startDate": "2026-02-15",
    "location": "Remote"
  }'
```

## SCIM Examples

List SCIM users:

```bash
curl \
  -H "Authorization: Bearer dev-scim-token" \
  http://localhost:3000/api/scim/v2/Users
```

Filter SCIM users:

```bash
curl \
  -H "Authorization: Bearer dev-scim-token" \
  'http://localhost:3000/api/scim/v2/Users?filter=userName%20eq%20%22alex.morgan%22'
```

Get service provider config:

```bash
curl \
  -H "Authorization: Bearer dev-scim-token" \
  http://localhost:3000/api/scim/v2/ServiceProviderConfig
```

## Project Structure

```txt
apps/web
  app                 Next.js app routes and API routes
  components          Employee form and table
  lib                 Auth, database, SCIM, and validation helpers
  prisma              SQLite schema and migration
  scripts             Optional employee import
infra/keycloak        Keycloak realm import
samples               Optional employee import samples
```
