#!/usr/bin/env bash
# End-to-end verification of the sdCart API against the running backend.
# Usage: bash scripts/verify-api.sh   (backend expected at localhost:8080)
set -u
BASE=http://localhost:8080/api/v1
PASS=0
FAIL=0

ok()  { echo "PASS: $1"; PASS=$((PASS + 1)); }
bad() { echo "FAIL: $1 -> ${2:-}"; FAIL=$((FAIL + 1)); }

jval() { python -c "import sys,json;d=json.load(sys.stdin);print($1)" 2>/dev/null; }
jnum() { python -c "import sys,json;d=json.load(sys.stdin);print(int($1))" 2>/dev/null; }

# ---------------------------------------------------------------- health
H=$(curl -s -m 5 http://localhost:8080/actuator/health | jval "d.get('status')")
[ "$H" = "UP" ] && ok "health" || bad "health" "$H"

# ---------------------------------------------------------------- public catalog
N=$(curl -s "$BASE/products?size=3" | jval "len(d['data']['content'])")
[ "$N" = "3" ] && ok "products list size=3" || bad "products list" "$N"

CN=$(curl -s "$BASE/products?category=electronics&featured=true&size=5" | jval "all(p['category']['slug']=='electronics' for p in d['data']['content']) if d['data']['content'] else 'empty'")
[ "$CN" = "True" ] && ok "products filtered by category slug" || bad "category filter" "$CN"

BN=$(curl -s "$BASE/products?brand=acme-electronics&size=10" | jval "all(p['brand']['slug']=='acme-electronics' for p in d['data']['content']) if d['data']['content'] else 'empty'")
[ "$BN" = "True" ] && ok "products filtered by brand slug" || bad "brand filter" "$BN"

QN=$(curl -s "$BASE/products?q=headphone&size=10" | jval "len(d['data']['content'])>0")
[ "$QN" = "True" ] && ok "products search q=headphone" || bad "search" "$QN"

PN=$(curl -s "$BASE/products?minPrice=100&maxPrice=300&size=20" | jval "all(100<=float(p['price'])<=300 for p in d['data']['content']) if d['data']['content'] else 'empty'")
[ "$PN" = "True" ] && ok "products price range filter" || bad "price filter" "$PN"

SN=$(curl -s "$BASE/products?sort=price,asc&size=5" | jval "[float(p['price']) for p in d['data']['content']]==sorted([float(p['price']) for p in d['data']['content']])")
[ "$SN" = "True" ] && ok "products sort price asc" || bad "sort" "$SN"

PID=$(curl -s "$BASE/products?sort=price,asc&size=1" | jval "d['data']['content'][0]['publicId']")
DN=$(curl -s "$BASE/products/$PID" | jval "d['data']['publicId']=='$PID'")
[ "$DN" = "True" ] && ok "product detail by publicId" || bad "product detail" "$DN"

CATN=$(curl -s "$BASE/categories?tree=true" | jval "len(d['data'])>0")
[ "$CATN" = "True" ] && ok "categories tree" || bad "categories" "$CATN"

BN2=$(curl -s "$BASE/brands" | jval "len(d['data'])>0")
[ "$BN2" = "True" ] && ok "brands list" || bad "brands" "$BN2"

# ---------------------------------------------------------------- auth
EMAIL="verify$(date +%s)@example.com"
AT=$(curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
  -d "{\"firstName\":\"Verify\",\"lastName\":\"User\",\"email\":\"$EMAIL\",\"password\":\"Password123!\",\"phone\":\"555-0001\"}" | jval "d['data']['accessToken']")
[ -n "$AT" ] && ok "register returns tokens" || bad "register"

CODE=$(curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
  -d "{\"firstName\":\"X\",\"lastName\":\"Y\",\"email\":\"$EMAIL\",\"password\":\"Password123!\"}" | jval "d.get('status', d.get('success'))")
[ "$CODE" = "409" ] && ok "duplicate register -> 409" || bad "dup register" "$CODE"

RT=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Password123!\"}" | jval "d['data']['refreshToken']")
[ -n "$RT" ] && ok "login returns refresh token" || bad "login"

AT=$(curl -s -X POST "$BASE/auth/refresh" -H 'Content-Type: application/json' \
  -d "{\"refreshToken\":\"$RT\"}" | jval "d['data']['accessToken']")
[ -n "$AT" ] && ok "refresh rotates access token" || bad "refresh"

ME=$(curl -s "$BASE/users/me" -H "Authorization: Bearer $AT" | jval "d['data']['email']")
[ "$ME" = "$EMAIL" ] && ok "users/me" || bad "users/me" "$ME"

C401=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/users/me")
[ "$C401" = "401" ] && ok "unauthorized -> 401" || bad "unauth 401" "$C401"

AUTH="Authorization: Bearer $AT"

# ---------------------------------------------------------------- cart
curl -s -X POST "$BASE/cart/items" -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"productId\":\"$PID\",\"quantity\":2}" > /dev/null
TOTQ=$(curl -s "$BASE/cart" -H "$AUTH" | jnum "d['data']['totalQuantity']")
[ "$TOTQ" = "2" ] && ok "cart add item (totalQuantity=2)" || bad "cart add" "$TOTQ"

CI=$(curl -s "$BASE/cart" -H "$AUTH" | jval "d['data']['items'][0]['publicId']")
TOTQ=$(curl -s -X PUT "$BASE/cart/items/$CI" -H "$AUTH" -H 'Content-Type: application/json' -d '{"quantity":3}' > /dev/null; curl -s "$BASE/cart" -H "$AUTH" | jnum "d['data']['totalQuantity']")
[ "$TOTQ" = "3" ] && ok "cart update quantity -> 3" || bad "cart update" "$TOTQ"

curl -s -X DELETE "$BASE/cart/items/$CI" -H "$AUTH" > /dev/null
NQ=$(curl -s "$BASE/cart" -H "$AUTH" | jnum "d['data']['totalQuantity']")
[ "$NQ" = "0" ] && ok "cart remove item" || bad "cart remove" "$NQ"

# ---------------------------------------------------------------- wishlist
curl -s -X POST "$BASE/wishlist/items" -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"productId\":\"$PID\"}" > /dev/null
WN=$(curl -s "$BASE/wishlist" -H "$AUTH" | jval "len(d['data']['items'])")
[ "$WN" = "1" ] && ok "wishlist add" || bad "wishlist add" "$WN"
curl -s -X DELETE "$BASE/wishlist/items/$PID" -H "$AUTH" > /dev/null
WN=$(curl -s "$BASE/wishlist" -H "$AUTH" | jval "len(d['data']['items'])")
[ "$WN" = "0" ] && ok "wishlist remove" || bad "wishlist remove" "$WN"

# ---------------------------------------------------------------- addresses
AID=$(curl -s -X POST "$BASE/addresses" -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"label":"Home","recipientName":"Verify User","phone":"555-0001","line1":"100 Market St","city":"San Francisco","state":"CA","postalCode":"94105","country":"USA","isDefault":true}' | jval "d['data']['publicId']")
[ -n "$AID" ] && ok "address create" || bad "address create"
AN=$(curl -s "$BASE/addresses" -H "$AUTH" | jval "len(d['data'])")
[ "$AN" = "1" ] && ok "address list" || bad "address list" "$AN"

# ---------------------------------------------------------------- coupon
CV=$(curl -s -X POST "$BASE/coupons/validate" -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"code":"WELCOME10","orderAmount":120}' | jval "d['data']['valid'] and float(d['data']['discountAmount'])>0")
[ "$CV" = "True" ] && ok "coupon validate WELCOME10" || bad "coupon validate"

# ---------------------------------------------------------------- orders
# Quantity 3 ensures the items subtotal clears WELCOME10's $50 minimum.
curl -s -X POST "$BASE/cart/items" -H "$AUTH" -H 'Content-Type: application/json' -d "{\"productId\":\"$PID\",\"quantity\":3}" > /dev/null
R=$(curl -s -X POST "$BASE/orders" -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"addressId\":\"$AID\",\"paymentMethod\":\"CARD\",\"couponCode\":\"WELCOME10\"}")
OID=$(echo "$R" | jval "d['data']['publicId']")
OS=$(echo "$R" | jval "d['data']['status']")
[ "$OS" = "PENDING" ] && ok "order placed (PENDING)" || bad "order place" "$R"

PS=$(curl -s -X POST "$BASE/payments/orders/$OID/pay" -H "$AUTH" | jval "d['data']['status']")
[ "$PS" = "COMPLETED" ] && ok "payment completed (mock gateway)" || bad "pay" "$PS"

OS2=$(curl -s "$BASE/orders/$OID" -H "$AUTH" | jval "d['data']['status']")
[ "$OS2" = "CONFIRMED" ] && ok "order confirmed after payment" || bad "order after pay" "$OS2"

ON=$(curl -s "$BASE/orders?page=0&size=5" -H "$AUTH" | jnum "d['data']['totalElements']")
[ "$ON" = "1" ] && ok "my orders list" || bad "orders list" "$ON"

# The CARD order above consumed the cart; stock it again for the cancel flow.
curl -s -X POST "$BASE/cart/items" -H "$AUTH" -H 'Content-Type: application/json' -d "{\"productId\":\"$PID\",\"quantity\":1}" > /dev/null
OID2=$(curl -s -X POST "$BASE/orders" -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"addressId\":\"$AID\",\"paymentMethod\":\"CASH_ON_DELIVERY\"}" | jval "d['data']['publicId']")
OS3=$(curl -s -X POST "$BASE/orders/$OID2/cancel" -H "$AUTH" | jval "d['data']['status']")
[ "$OS3" = "CANCELLED" ] && ok "order cancel" || bad "order cancel" "$OS3"

# ---------------------------------------------------------------- reviews
RID=$(curl -s -X POST "$BASE/reviews" -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"productId\":\"$PID\",\"rating\":5,\"title\":\"Great\",\"comment\":\"Loved it\"}" | jval "d['data']['publicId']")
[ -n "$RID" ] && ok "review create" || bad "review create"

RN=$(curl -s "$BASE/products/$PID/reviews?size=5" | jval "len(d['data']['content'])>0")
[ "$RN" = "True" ] && ok "product reviews list" || bad "reviews list" "$RN"

RV=$(curl -s -X PUT "$BASE/reviews/$RID" -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"rating":4,"title":"Updated","comment":"Still good"}' | jval "d['data']['rating']")
[ "$RV" = "4" ] && ok "review update" || bad "review update" "$RV"

CD=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/reviews/$RID" -H "$AUTH")
[ "$CD" = "200" ] && ok "review delete" || bad "review delete" "$CD"

# ---------------------------------------------------------------- admin
AAT=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"admin@sdcart.com","password":"password"}' | jval "d['data']['accessToken']")
[ -n "$AAT" ] && ok "admin login" || bad "admin login"
AAUTH="Authorization: Bearer $AAT"

APN=$(curl -s "$BASE/admin/products?size=5" -H "$AAUTH" | jnum "d['data']['totalElements']")
[ "${APN:-0}" -ge 5 ] 2>/dev/null && ok "admin products list" || bad "admin products" "$APN"

AUN=$(curl -s "$BASE/admin/users?size=5" -H "$AAUTH" | jnum "d['data']['totalElements']")
[ "${AUN:-0}" -ge 2 ] 2>/dev/null && ok "admin users list" || bad "admin users" "$AUN"

AON=$(curl -s "$BASE/admin/orders?status=PENDING&size=5" -H "$AAUTH" | jnum "d['data']['totalElements']")
[ -n "$AON" ] && ok "admin orders (status filter)" || bad "admin orders" "$AON"

APMN=$(curl -s "$BASE/admin/payments?size=5" -H "$AAUTH" | jnum "d['data']['totalElements']")
[ -n "$APMN" ] && ok "admin payments list" || bad "admin payments" "$APMN"

ACN=$(curl -s "$BASE/admin/coupons?size=5" -H "$AAUTH" | jnum "d['data']['totalElements']")
[ "${ACN:-0}" -ge 2 ] 2>/dev/null && ok "admin coupons list" || bad "admin coupons" "$ACN"

NPID=$(curl -s -X POST "$BASE/admin/products" -H "$AAUTH" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Verify Product $(date +%s)\",\"price\":19.99,\"stockQuantity\":10,\"status\":\"ACTIVE\",\"featured\":false}" | jval "d['data']['publicId']")
[ -n "$NPID" ] && ok "admin product create" || bad "admin product create"

NPS=$(curl -s -X PATCH "$BASE/admin/products/$NPID/status" -H "$AAUTH" -H 'Content-Type: application/json' \
  -d '{"status":"DRAFT"}' | jval "d['data']['status']")
[ "$NPS" = "DRAFT" ] && ok "admin product status patch" || bad "admin status patch" "$NPS"

DEL=$(curl -s -X DELETE "$BASE/admin/products/$NPID" -H "$AAUTH" | jval "d['success']")
[ "$DEL" = "True" ] && ok "admin product delete" || bad "admin product delete" "$DEL"

NCID=$(curl -s -X POST "$BASE/admin/categories" -H "$AAUTH" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Verify Cat $(date +%s)\",\"active\":true}" | jval "d['data']['publicId']")
[ -n "$NCID" ] && ok "admin category create" || bad "admin category create"
[ -n "$NCID" ] && curl -s -X DELETE "$BASE/admin/categories/$NCID" -H "$AAUTH" > /dev/null

NBID=$(curl -s -X POST "$BASE/admin/brands" -H "$AAUTH" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Verify Brand $(date +%s)\",\"active\":true}" | jval "d['data']['publicId']")
[ -n "$NBID" ] && ok "admin brand create" || bad "admin brand create"
[ -n "$NBID" ] && curl -s -X DELETE "$BASE/admin/brands/$NBID" -H "$AAUTH" > /dev/null

NCU=$(curl -s -X POST "$BASE/admin/coupons" -H "$AAUTH" -H 'Content-Type: application/json' \
  -d "{\"code\":\"VERIFY$(date +%s)\",\"type\":\"PERCENTAGE\",\"value\":5,\"minOrderAmount\":10,\"maxUsages\":10,\"perUserLimit\":1,\"validFrom\":\"2026-01-01T00:00:00Z\",\"validUntil\":\"2027-01-01T00:00:00Z\",\"active\":true}" | jval "d['data']['publicId']")
[ -n "$NCU" ] && ok "admin coupon create" || bad "admin coupon create"

C403=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/admin/products" -H "$AUTH")
[ "$C403" = "403" ] && ok "admin access denied for USER -> 403" || bad "admin 403" "$C403"

# The order tests above consumed the cart; stock it again for this one.
curl -s -X POST "$BASE/cart/items" -H "$AUTH" -H 'Content-Type: application/json' -d "{\"productId\":\"$PID\",\"quantity\":1}" > /dev/null
OID3=$(curl -s -X POST "$BASE/orders" -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"addressId\":\"$AID\",\"paymentMethod\":\"CASH_ON_DELIVERY\"}" | jval "d['data']['publicId']")
OS4=$(curl -s -X PATCH "$BASE/admin/orders/$OID3/status" -H "$AAUTH" -H 'Content-Type: application/json' \
  -d '{"status":"CONFIRMED"}' | jval "d['data']['status']")
[ "$OS4" = "CONFIRMED" ] && ok "admin order status update" || bad "admin order status" "$OS4"

# ---------------------------------------------------------------- summary
echo ""
echo "RESULT: $PASS passed, $FAIL failed"
[ "$FAIL" = "0" ]
