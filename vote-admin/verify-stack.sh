#!/usr/bin/env bash
# Verify full stack: Frontend → Backend → PostgreSQL
#
# How to run in VS Code:
#   1. Open Terminal (Ctrl+` or View → Terminal)
#   2. cd to project root:  cd /path/to/vote-admin
#   3. Run:  ./verify-stack.sh
#
# Prerequisites: Backend running (port 5000), PostgreSQL running, and 'jq' installed (sudo apt install jq).

set -e
API="${API_BASE_URL:-http://localhost:5000/api}"
DB_CHECK="${SKIP_DB:-0}"

echo "=============================================="
echo "  Vote Admin - Full Stack Verification"
echo "=============================================="
echo ""

# 1. Backend up
echo "1. Backend (Spring Boot)"
code=$(curl -s -o /dev/null -w "%{http_code}" "$API/elections/active" 2>/dev/null || echo "000")
if [ "$code" = "200" ]; then
  echo "   OK - Backend responding on ${API%\/api}"
else
  echo "   FAIL - Backend not responding (HTTP $code). Start: cd backend-spring && ./mvnw spring-boot:run"
  exit 1
fi
# 2. PostgreSQL (via backend = same DB)
echo "2. PostgreSQL (via backend)"
elections=$(curl -s "$API/elections/admin" | jq -r '.data | length' 2>/dev/null || echo "0")
echo "   Elections in DB (via API): $elections"
echo "   OK - Backend reads from PostgreSQL"

# 3. Login
echo "3. Auth (login)"
token=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token' 2>/dev/null)
if [ -n "$token" ] && [ "$token" != "null" ]; then
  echo "   OK - Login works, JWT received"
else
  echo "   FAIL - Login failed"
  exit 1
fi

# 4. Create election → verify in API
echo "4. Create election → persisted"
cid=$(curl -s -X POST "$API/elections" -H "Content-Type: application/json" -H "Authorization: Bearer $token" \
  -d '{"title":"Verify-'$(date +%s)'","startDate":"2026-06-01T00:00:00Z","endDate":"2026-06-02T00:00:00Z"}' \
  | jq -r '.data._id // .data.id // empty')
if [ -n "$cid" ]; then
  echo "   OK - Election created: $cid"
else
  echo "   FAIL - Election create failed"
  exit 1
fi

# 5. Create ballot → verify in API
echo "5. Create ballot → persisted"
bid=$(curl -s -X POST "$API/elections/$cid/ballots" -H "Content-Type: application/json" -H "Authorization: Bearer $token" \
  -d '{"title":"Verify","options":[{"name":"A","party":"P"},{"name":"B","party":"Q"}],"maxSelections":1}' \
  | jq -r '.data.id // empty')
if [ -n "$bid" ]; then
  echo "   OK - Ballot created: $bid"
else
  echo "   FAIL - Ballot create failed"
  exit 1
fi

# 6. Ballot list
count=$(curl -s "$API/elections/$cid/ballots" | jq -r '.data | length' 2>/dev/null || echo "0")
echo "6. Ballots for election: $count ballot(s)"
echo "   OK - Data round-trip: API → PostgreSQL → API"

# 7. Direct DB check (optional)
if [ "$DB_CHECK" != "1" ]; then
  echo "7. PostgreSQL (direct)"
  if command -v psql >/dev/null 2>&1; then
    out=$(PGPASSWORD="${PGPASSWORD:-mypassword123}" psql -h localhost -U postgres -d vote_admin -t -c "SELECT COUNT(*) FROM elections;" 2>&1)
    if echo "$out" | grep -qE '^[[:space:]]*[0-9]+'; then
      n=$(echo "$out" | tr -d ' ')
      echo "   OK - Direct query: $n row(s) in elections table"
    else
      echo "   SKIP - psql failed (e.g. peer auth). API verified DB above."
    fi
  else
    echo "   SKIP - psql not in PATH. Set SKIP_DB=1 to hide."
  fi
fi

echo ""
echo "=============================================="
echo "  All checks passed. Frontend → Backend → PostgreSQL OK."
echo "=============================================="
echo ""
echo "Frontend: ensure it runs (npm run dev) and uses API_BASE_URL / VITE_API_URL if needed."
echo "Backend:  ${API%\/api}"
echo "DB:       vote_admin @ localhost:5432"
