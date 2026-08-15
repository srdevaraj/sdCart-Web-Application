# sdCart Backend

Production-ready e-commerce REST API built with **Java 21, Spring Boot 3.5, PostgreSQL, Spring Security (JWT), Spring Data JPA, Flyway** and **Docker**.

## Stack

| Layer          | Technology                                        |
|----------------|---------------------------------------------------|
| Runtime        | Java 21 (LTS)                                     |
| Framework      | Spring Boot 3.5, Spring MVC                       |
| Persistence    | Spring Data JPA + Hibernate (PostgreSQL)          |
| Migrations     | Flyway (schema owned by SQL, `ddl-auto=validate`) |
| Security       | Spring Security, stateless JWT (access + refresh) |
| Validation     | Jakarta Bean Validation                           |
| API docs       | springdoc OpenAPI / Swagger UI                    |
| Monitoring     | Spring Boot Actuator                              |
| Build/Deploy   | Maven 3.9 (wrapper included), Docker, Compose     |

## Quick start (Docker)

```bash
cp .env.example .env   # optional; sensible dev defaults exist
docker compose up --build
```

The API is available at `http://localhost:8080`, Swagger UI at
`http://localhost:8080/swagger-ui.html`, health at `http://localhost:8080/actuator/health`.

## Local development (no Docker)

Requires a PostgreSQL 14+ instance on `localhost:5432` with database `sdcart`
(user `postgres` / `password` by default — overridable via env vars).

```bash
./mvnw spring-boot:run          # Linux/macOS
mvnw.cmd spring-boot:run        # Windows
```

Flyway creates and seeds the schema automatically on startup
(roles, categories, brands, sample products, coupons).

### Default admin account (dev profile only)

`ADMIN_PASSWORD` defaults to `password` in the dev profile and the admin user
(`admin@sdcart.com` / `password`) is bootstrapped automatically. **Change it
immediately** and never rely on it outside local development — in production
no default exists, so the admin is only created when `ADMIN_PASSWORD` is
explicitly set.

## Configuration

All secrets come from environment variables (see `.env.example`):

| Variable                 | Purpose                                   | Default (dev)                        |
|--------------------------|-------------------------------------------|--------------------------------------|
| `DATABASE_URL`           | JDBC URL                                  | `jdbc:postgresql://localhost:5432/sdcart` |
| `DATABASE_USERNAME`      | DB user                                   | `postgres`                           |
| `DATABASE_PASSWORD`      | DB password                               | `password`                           |
| `JWT_SECRET`             | HMAC key, **≥ 32 chars**, required in prod| dev-only placeholder                 |
| `JWT_ACCESS_EXPIRATION`  | Access token TTL (ms)                     | `900000` (15 min)                    |
| `JWT_REFRESH_EXPIRATION` | Refresh token TTL (ms)                    | `604800000` (7 days)                 |
| `FRONTEND_URL`           | CORS allowed origin(s, comma separated)   | `http://localhost:3000`              |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin bootstrap          | admin@sdcart.com / password (dev)    |
| `SPRING_PROFILES_ACTIVE` | `dev` or `prod`                           | `dev`                                |

Placeholders exist for Cloudinary, Stripe and SMTP — no real credentials are
ever committed. **Never commit `.env`.**

Profiles:
- `dev` — SQL logging, debug level for `com.sdcart`, admin defaults, permissive pool.
- `prod` — `ddl-auto=validate`, strict Flyway (`clean-disabled`), fail-fast on
  default JWT secret, forward headers behind a proxy, compression enabled.

## Architecture

Domain/feature-oriented packages under `com.sdcart`:

```
config/      OpenAPI, typed app properties, admin bootstrap
security/    JWT service + filter, principal, entry points, SecurityConfig
common/      ApiResponse / ErrorResponse envelopes, PageResponse, BaseEntity,
             GlobalExceptionHandler (@RestControllerAdvice), SlugUtils
auth/        register / login / refresh
user/        profile, password, admin user management
product/ category/ brand/     catalog
cart/ wishlist/ address/      shopping primitives
order/ payment/                checkout lifecycle
review/ coupon/                engagement & promotions
admin/       management endpoints (ROLE_ADMIN)
```

**Conventions**

- Controller → Service → Repository, constructor injection everywhere.
- JPA entities are **never** exposed; every endpoint returns DTOs.
- Consistent envelope: success `{success, message, data, timestamp}`, error
  `{success, message, status, path, timestamp, errors[]}` via
  `GlobalExceptionHandler`.
- Internal `id` is never exposed; public UUID (`publicId`) is the API key.
- `BaseEntity` provides `createdAt` / `updatedAt` auditing and `publicId`.
- Pagination everywhere via `PageResponse<T>` (`page`, `size`, `totalElements`, …).
- Database indexes on FKs and hot query paths; unique constraints enforce
  business invariants (email, slug, coupon code, cart/wishlist uniqueness, …).
- Transactions are method-boundary scoped (`@Transactional`) — checkout, stock
  decrement, coupon usage and payment creation commit atomically.
- Logging is structured and never includes passwords, tokens or PII.

## API overview

| Method | Path                              | Access  | Description                          |
|--------|-----------------------------------|---------|--------------------------------------|
| POST   | `/api/v1/auth/register`           | public  | Create account, returns tokens       |
| POST   | `/api/v1/auth/login`              | public  | Authenticate, returns tokens         |
| POST   | `/api/v1/auth/refresh`            | public  | Rotate refresh token                 |
| POST   | `/api/v1/auth/logout`             | auth    | Stateless logout                     |
| GET    | `/api/v1/products`                | public  | Search/filter catalog (paginated)    |
| GET    | `/api/v1/products/{id}`           | public  | Product detail                       |
| GET    | `/api/v1/categories` (`?tree=true`) | public | Category list/tree                 |
| GET    | `/api/v1/brands`                  | public  | Brand list                           |
| GET    | `/api/v1/users/me`                | auth    | Current profile                      |
| GET/POST/PUT/DELETE | `/api/v1/cart`…    | auth    | Cart operations                      |
| GET/POST/DELETE | `/api/v1/wishlist/items`  | auth    | Wishlist operations                  |
| CRUD   | `/api/v1/addresses`               | auth    | Address book                         |
| POST   | `/api/v1/orders`                  | auth    | Checkout from cart                   |
| GET    | `/api/v1/orders`                  | auth    | My orders (paginated)                |
| POST   | `/api/v1/orders/{id}/cancel`      | auth    | Cancel pending order                 |
| POST   | `/api/v1/payments/orders/{id}/pay`| auth    | Pay pending order (mock gateway)     |
| POST   | `/api/v1/reviews`                 | auth    | Review a purchased product           |
| GET    | `/api/v1/products/{id}/reviews`   | public  | Product reviews (paginated)          |
| POST   | `/api/v1/coupons/validate`        | auth    | Validate a coupon for an amount      |
| `*`    | `/api/v1/admin/**`                | admin   | Product/category/brand/coupon/order/user/payment management |

### Example — register & login

```bash
curl -s -X POST localhost:8080/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","password":"Password123!"}'

curl -s -X POST localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"jane@example.com","password":"Password123!"}'

curl -s localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Testing

```bash
./mvnw test        # unit tests (JWT, coupon, cart, order logic)
./mvnw verify      # full build incl. tests
```

## Production notes

- Use `SPRING_PROFILES_ACTIVE=prod` and inject every secret via the
  environment (Kubernetes secrets, AWS Secrets Manager, etc.).
- Replace the mock payment gateway with a real provider behind `PaymentService`.
- Flyway migrations are append-only; never edit an applied migration.
- `ddl-auto=validate` fails startup if entities and migrations drift.
