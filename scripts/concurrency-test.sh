#!/usr/bin/env bash
# ============================================================================
# sdCart — production-readiness concurrency test
#
# Verifies, against a RUNNING backend (default http://localhost:8080, dev
# profile with the seeded admin@sdcart.com / password):
#
#   1. Stock integrity  — 8 concurrent checkouts on a product with stock 5:
#                          exactly 5 succeed, stock never goes negative.
#   2. Coupon limits    — 3 concurrent checkouts using a coupon with
#                          maxUsages=2: exactly 2 succeed, used_count == 2.
#   3. Double payment   — 2 concurrent pay requests for one order: exactly
#                          one completes, the order is confirmed once.
#
# The test is self-contained: it creates its own products, coupon, addresses
# and throwaway users, then cleans nothing (users/orders remain as test data
# in the LOCAL database only — never run this against production).
#
# Usage: bash scripts/concurrency-test.sh
# ============================================================================
set -u
BASE=${BASE:-http://localhost:8080/api/v1}
PASS=0
FAIL=0

ok()  { echo "PASS: $1"; PASS=$((PASS + 1)); }
bad() { echo "FAIL: $1 -> ${2:-}"; FAIL=$((FAIL + 1)); }

jval() { python -c "import sys,json;d=json.load(sys.stdin);print($1)" 2>/dev/null; }

STAMP=$(date +%s)
echo "== sdCart concurrency test (stamp $STAMP) =="

# ---------------------------------------------------------------- admin login
AAT=$(curl -s -m 10 -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"admin@sdcart.com","password":"password"}' | jval "d['data']['accessToken']")
[ -n "$AAT" ] && ok "admin login" || { bad "admin login (needs dev seed admin)"; exit 1; }
AAUTH="Authorization: Bearer $AAT"

# ---------------------------------------------------------------- fixtures
PID1=$(curl -s -X POST "$BASE/admin/products" -H "$AAUTH" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Concurrency P1 $STAMP\",\"price\":10.00,\"stockQuantity\":5,\"status\":\"ACTIVE\",\"featured\":false}" | jval "d['data']['publicId']")
PID2=$(curl -s -X POST "$BASE/admin/products" -H "$AAUTH" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Concurrency P2 $STAMP\",\"price\":5.00,\"stockQuantity\":30,\"status\":\"ACTIVE\",\"featured\":false}" | jval "d['data']['publicId']")
CODE="CONC$STAMP"
curl -s -X POST "$BASE/admin/coupons" -H "$AAUTH" -H 'Content-Type: application/json' \
  -d "{\"code\":\"$CODE\",\"type\":\"PERCENTAGE\",\"value\":5,\"minOrderAmount\":0,\"maxUsages\":2,\"perUserLimit\":1,\"validFrom\":\"2026-01-01T00:00:00Z\",\"validUntil\":\"2027-12-31T00:00:00Z\",\"active\":true}" > /dev/null
[ -n "$PID1" ] && [ -n "$PID2" ] && ok "fixtures created (products + coupon $CODE)" || bad "fixtures" "$PID1 $PID2"

# Helper: register a user, stock cart with one product and create an address.
# Does NOT place an order — callers fire the order concurrently themselves.
setup_user() { # $1=email-prefix $2=productId
  local email="con$1$STAMP@example.com"
  local at addr
  at=$(curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
    -d "{\"firstName\":\"Con\",\"lastName\":\"Test\",\"email\":\"$email\",\"password\":\"Password123!\"}" | jval "d['data']['accessToken']")
  curl -s -X POST "$BASE/cart/items" -H "Authorization: Bearer $at" -H 'Content-Type: application/json' \
    -d "{\"productId\":\"$2\",\"quantity\":1}" > /dev/null
  addr=$(curl -s -X POST "$BASE/addresses" -H "Authorization: Bearer $at" -H 'Content-Type: application/json' \
    -d '{"label":"Home","recipientName":"Con Test","phone":"555-0001","line1":"1 Main St","city":"Springfield","state":"CA","postalCode":"90001","country":"USA","isDefault":true}' | jval "d['data']['publicId']")
  echo "$at|$addr"
}

place_order_only() { # $1=AT $2=ADDR $3=coupon-or-empty
  local at="$1" addr="$2" body
  if [ -n "$3" ]; then
    body="{\"addressId\":\"$addr\",\"paymentMethod\":\"CARD\",\"couponCode\":\"$3\"}"
  else
    body="{\"addressId\":\"$addr\",\"paymentMethod\":\"CARD\"}"
  fi
  curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/orders" -H "Authorization: Bearer $at" -H 'Content-Type: application/json' -d "$body"
}

# ================================================================ 1. STOCK
echo ""
echo "--- 1. Stock integrity: 8 concurrent checkouts, stock=5 ---"
declare -a STOCK_AT STOCK_ADDR
for i in $(seq 1 8); do
  out=$(setup_user "s$i" "$PID1")
  STOCK_AT[$i]=$(echo "$out" | cut -d'|' -f1)
  STOCK_ADDR[$i]=$(echo "$out" | cut -d'|' -f2)
done
# Fire the 8 order placements simultaneously.
for i in $(seq 1 8); do
  place_order_only "${STOCK_AT[$i]}" "${STOCK_ADDR[$i]}" "" > /tmp/stock_$i.code &
done
wait
OKS=0; FAILS=0
for i in $(seq 1 8); do
  code=$(cat /tmp/stock_$i.code); rm -f /tmp/stock_$i.code
  if [ "$code" = "201" ]; then OKS=$((OKS+1)); else FAILS=$((FAILS+1)); fi
done
echo "  successes=$OKS failures=$FAILS"
[ "$OKS" = "5" ] && ok "exactly 5 of 8 concurrent checkouts succeeded" || bad "stock success count" "$OKS"
[ "$FAILS" = "3" ] && ok "exactly 3 rejected" || bad "stock rejection count" "$FAILS"
STOCK=$(curl -s "$BASE/admin/products/$PID1" -H "$AAUTH" | jval "d['data']['stockQuantity']")
[ "$STOCK" = "0" ] && ok "final stock == 0 (never negative)" || bad "final stock" "$STOCK"

# ================================================================ 2. COUPON
echo ""
echo "--- 2. Coupon limits: 3 concurrent checkouts, maxUsages=2 ---"
declare -a COUP_AT COUP_ADDR
for i in $(seq 1 3); do
  out=$(setup_user "c$i" "$PID2")
  COUP_AT[$i]=$(echo "$out" | cut -d'|' -f1)
  COUP_ADDR[$i]=$(echo "$out" | cut -d'|' -f2)
done
for i in $(seq 1 3); do
  curl -s -o /tmp/coup_$i.json -w "%{http_code}" -X POST "$BASE/orders" \
    -H "Authorization: Bearer ${COUP_AT[$i]}" -H 'Content-Type: application/json' \
    -d "{\"addressId\":\"${COUP_ADDR[$i]}\",\"paymentMethod\":\"CARD\",\"couponCode\":\"$CODE\"}" > /tmp/coup_$i.code &
done
wait
OKS=0; PAY_OID=""; PAY_AT=""
for i in $(seq 1 3); do
  code=$(cat /tmp/coup_$i.code)
  if [ "$code" = "201" ]; then
    OKS=$((OKS+1))
    if [ -z "$PAY_OID" ]; then
      PAY_OID=$(cat /tmp/coup_$i.json | jval "d['data']['publicId']")
      PAY_AT=${COUP_AT[$i]}
    fi
  fi
  rm -f /tmp/coup_$i.code /tmp/coup_$i.json
done
echo "  coupon-order successes=$OKS"
[ "$OKS" = "2" ] && ok "exactly 2 of 3 concurrent coupon orders succeeded" || bad "coupon success count" "$OKS"
USED=$(curl -s "$BASE/admin/coupons?size=50" -H "$AAUTH" | python -c "
import sys,json
d=json.load(sys.stdin)
for c in d['data']['content']:
    if c['code']=='$CODE':
        print(c['usedCount']); break
" 2>/dev/null)
[ "$USED" = "2" ] && ok "coupon usedCount == 2 (never exceeds maxUsages)" || bad "coupon usedCount" "$USED"

# ================================================================ 3. DOUBLE PAY
echo ""
echo "--- 3. Double payment: 2 concurrent pay requests on one order ---"
OID=$PAY_OID
[ -n "$OID" ] && ok "order for payment test found" || { bad "order lookup"; exit 1; }
for i in 1 2; do
  curl -s -o /tmp/pay_$i.json -w "%{http_code}" -X POST "$BASE/payments/orders/$OID/pay" -H "Authorization: Bearer $PAY_AT" > /tmp/pay_$i.code &
done
wait
P1=$(cat /tmp/pay_1.code); P2=$(cat /tmp/pay_2.code)
S1=$(cat /tmp/pay_1.json | jval "d['data']['status']")
S2=$(cat /tmp/pay_2.json | jval "d['data']['status']")
rm -f /tmp/pay_1.json /tmp/pay_2.json /tmp/pay_1.code /tmp/pay_2.code
echo "  pay#1 http=$P1 status=$S1 ; pay#2 http=$P2 status=$S2"
[ "$S1" = "COMPLETED" ] && [ "$S2" = "COMPLETED" ] && bad "double payment succeeded" "both COMPLETED" \
  || ok "at most one payment completed"
CONFIRMED=$(curl -s "$BASE/orders/$OID" -H "Authorization: Bearer $PAY_AT" | jval "d['data']['status']")
[ "$CONFIRMED" = "CONFIRMED" ] && ok "order confirmed once" || bad "order status" "$CONFIRMED"

# ================================================================ summary
echo ""
echo "RESULT: $PASS passed, $FAIL failed"
[ "$FAIL" = "0" ]
