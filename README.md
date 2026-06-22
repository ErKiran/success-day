# Success Day

Success Day is a minimal HR source application for IAM and IGA labs.

**HRIS for Hustler**

It provides Keycloak login, employee management, CSV/JSON import, a SQLite-backed HR database, and a small SCIM 2.0 Users API.

## Start The Lab

Run:

```bash
./start.sh
```

If you prefer Docker Compose directly, run the same startup sequence:

```bash
docker compose up -d keycloak-db keycloak
docker compose run --rm keycloak-bootstrap
docker compose up --build success-day-web
```

## Get Started With Success Day

[![Watch the demo](https://img.youtube.com/vi/7zqocaB66f8/maxresdefault.jpg)](https://youtu.be/7zqocaB66f8?si=xb-Gt6RIe7LCuTtx)


## SCIM with Okta

[![SuccessDay HRIS to Okta SCIM Demo](https://img.youtube.com/vi/4FVbAhuL9CM/maxresdefault.jpg)](https://youtu.be/4FVbAhuL9CM?si=dxD4qV5uXjo4iOKV)

## Success Day with Sailpoint 

[![SuccessDay HRIS to SailPoint Demo](https://img.youtube.com/vi/_THpHbczo3Y/maxresdefault.jpg)](https://youtu.be/_THpHbczo3Y?si=Ve2FtIM-UmmuBx8R)

If startup says Docker is not running, open Docker Desktop first and wait until the engine is ready.

This starts:

- Success Day at `http://localhost:3000`
- Keycloak at `http://localhost:8080`
- Postgres for Keycloak
- SQLite for Success Day in the `success_day_data` Docker volume

The app uses `KEYCLOAK_ISSUER` for browser-facing redirects and `KEYCLOAK_INTERNAL_ISSUER` for container-to-container OIDC calls.

The HR database starts empty.

## Default URLs

- Success Day App: `http://localhost:3000`
- API Docs: `http://localhost:3000/api-docs`
- Keycloak Admin Console: `http://localhost:8080`
- SCIM Base URL: `http://localhost:3000/api/scim/v2`

## Credentials

Keycloak admin console:

```txt
Username: admin
Password: admin
```

Success Day admin app login:

```txt
Username: admin@successday.local
Password: Admin123!
```

Success Day developer app login:

```txt
Username: developer@successday.local
Password: Developer123!
Permissions: developer:sso, developer:saml
```

Startup also runs an idempotent Keycloak bootstrap step, so existing lab volumes get this developer role and user automatically.

To add more bootstrap roles or users later, update:

```txt
infra/keycloak/bootstrap-roles.tsv
infra/keycloak/bootstrap-users.tsv
```

Then run `./start.sh` again. The sync step is repeatable; it creates missing roles/users and updates existing bootstrap users.

SCIM API:

```txt
Bearer Token: dev-scim-token
Basic Username: scim
Basic Password: scim-secret
```

## Employee Management

After logging in, use `/employees` to list employees, add a new employee, edit an existing employee, or import employees from CSV/JSON.

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

## Developer SSO Dashboard

Developers with the `success-day-developer` role are routed to `/developer`.

The developer dashboard stores SAML SSO configurations in the Success Day database. Each configuration supports create, edit, enable, disable, and delete actions. After saving a SAML provider, the dashboard shows the generated service provider values for IdP setup:

```txt
Entity ID: http://localhost:3000/api/saml/{configurationId}/metadata
ACS URL: http://localhost:3000/api/saml/{configurationId}/acs
```

The ACS endpoint accepts SAML HTTP-POST responses and validates the response or assertion signature against the uploaded IdP certificate. It also checks issuer, audience, and assertion time validity before returning the verified profile.

The app can also initiate SAML login through the currently enabled configuration:

```txt
http://localhost:3000/api/saml/login
```

After assertion validation, Success Day verifies the SAML user exists in Keycloak, loads the user's Keycloak realm roles, creates a signed app session, and redirects to the role-specific dashboard.

The import supports these columns:

```txt
employeeId,firstName,lastName,email,username,phoneNumber,department,jobTitle,managerEmail,employmentType,contractDuration,status,startDate,location,country,state,streetAddress
```

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
    "phoneNumber": "+1 555 0104",
    "department": "Security",
    "jobTitle": "Security Engineer",
    "managerEmail": "manager@example.com",
    "employmentType": "FULL_TIME",
    "contractDuration": "",
    "status": "ACTIVE",
    "startDate": "2026-02-15",
    "location": "Remote",
    "country": "United States",
    "state": "Illinois",
    "streetAddress": ""
  }'
```

## SCIM Examples

List SCIM users:

```bash
curl \
  -H "Authorization: Bearer dev-scim-token" \
  http://localhost:3000/api/scim/v2/Users
```

Or with static basic credentials:

```bash
curl \
  -u scim:scim-secret \
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
