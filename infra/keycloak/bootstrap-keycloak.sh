#!/bin/sh
set -eu

KC="/opt/keycloak/bin/kcadm.sh"
REALM="${SUCCESS_DAY_REALM:-success-day}"
SERVER="${KEYCLOAK_SERVER:-http://keycloak:8080}"
ROLES_FILE="${KEYCLOAK_BOOTSTRAP_ROLES:-/opt/keycloak/bootstrap/roles.tsv}"
USERS_FILE="${KEYCLOAK_BOOTSTRAP_USERS:-/opt/keycloak/bootstrap/users.tsv}"

echo "Syncing Success Day Keycloak bootstrap data..."

until "$KC" config credentials \
  --server "$SERVER" \
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

sync_role() {
  role_name="$1"
  role_description="$2"

  if "$KC" get "roles/${role_name}" -r "$REALM" >/dev/null 2>&1; then
    "$KC" update "roles/${role_name}" -r "$REALM" \
      -s "description=${role_description}" >/dev/null
  else
    "$KC" create roles -r "$REALM" \
      -s "name=${role_name}" \
      -s "description=${role_description}" >/dev/null
  fi
}

sync_user() {
  username="$1"
  email="$2"
  first_name="$3"
  last_name="$4"
  password="$5"
  role_names="$6"

  user_id="$("$KC" get users -r "$REALM" -q "username=${username}" --fields id | sed -n 's/.*"id" *: *"\([^"]*\)".*/\1/p' | head -n 1)"

  if [ -z "$user_id" ]; then
    "$KC" create users -r "$REALM" \
      -s "username=${username}" \
      -s "email=${email}" \
      -s "firstName=${first_name}" \
      -s "lastName=${last_name}" \
      -s "enabled=true" \
      -s "emailVerified=true" >/dev/null
  else
    "$KC" update "users/${user_id}" -r "$REALM" \
      -s "email=${email}" \
      -s "firstName=${first_name}" \
      -s "lastName=${last_name}" \
      -s "enabled=true" \
      -s "emailVerified=true" >/dev/null
  fi

  "$KC" set-password -r "$REALM" \
    --username "$username" \
    --new-password "$password" \
    --temporary=false >/dev/null

  old_ifs="$IFS"
  IFS=","
  for role_name in $role_names; do
    [ -n "$role_name" ] || continue
    "$KC" add-roles -r "$REALM" \
      --uusername "$username" \
      --rolename "$role_name" >/dev/null 2>&1 || true
  done
  IFS="$old_ifs"
}

if [ -f "$ROLES_FILE" ]; then
  while IFS="$(printf '\t')" read -r role_name role_description _rest; do
    case "$role_name" in
      ""|\#*) continue ;;
    esac
    sync_role "$role_name" "$role_description"
    echo "Role ready: ${role_name}"
  done < "$ROLES_FILE"
fi

if [ -f "$USERS_FILE" ]; then
  while IFS="$(printf '\t')" read -r username email first_name last_name password role_names _rest; do
    case "$username" in
      ""|\#*) continue ;;
    esac
    sync_user "$username" "$email" "$first_name" "$last_name" "$password" "$role_names"
    echo "User ready: ${username}"
  done < "$USERS_FILE"
fi

echo "Keycloak bootstrap sync complete."
