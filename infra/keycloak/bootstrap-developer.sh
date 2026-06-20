#!/bin/sh
set -eu

KC="/opt/keycloak/bin/kcadm.sh"
REALM="success-day"
ROLE="success-day-developer"
DEV_USERNAME="developer@successday.local"
DEV_PASSWORD="Developer123!"

echo "Ensuring Success Day developer role and user..."

until "$KC" config credentials \
  --server "http://keycloak:8080" \
  --realm master \
  --user "${KEYCLOAK_ADMIN:-admin}" \
  --password "${KEYCLOAK_ADMIN_PASSWORD:-admin}" >/dev/null 2>&1; do
  echo "Waiting for Keycloak admin API..."
  sleep 3
done

until "$KC" get "realms/${REALM}" >/dev/null 2>&1; do
  echo "Waiting for ${REALM} realm..."
  sleep 2
done

if ! "$KC" get "roles/${ROLE}" -r "$REALM" >/dev/null 2>&1; then
  "$KC" create roles -r "$REALM" \
    -s "name=${ROLE}" \
    -s "description=Success Day developer with SSO configuration access"
fi

USER_ID="$("$KC" get users -r "$REALM" -q "username=${DEV_USERNAME}" --fields id | sed -n 's/.*"id" *: *"\([^"]*\)".*/\1/p' | head -n 1)"

if [ -z "$USER_ID" ]; then
  "$KC" create users -r "$REALM" \
    -s "username=${DEV_USERNAME}" \
    -s "email=${DEV_USERNAME}" \
    -s "firstName=Success" \
    -s "lastName=Developer" \
    -s "enabled=true" \
    -s "emailVerified=true"
fi

"$KC" set-password -r "$REALM" \
  --username "$DEV_USERNAME" \
  --new-password "$DEV_PASSWORD" \
  --temporary=false

"$KC" add-roles -r "$REALM" \
  --uusername "$DEV_USERNAME" \
  --rolename "$ROLE" >/dev/null 2>&1 || true

echo "Developer login is ready: ${DEV_USERNAME} / ${DEV_PASSWORD}"
