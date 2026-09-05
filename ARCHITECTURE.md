# ARCHITECTURE.md

## Overview

A checkout app composed of two deployable units:

- `frontend/` — Vue 3 SPA with Vuex and Vite, mobile-first.
- `backend/` — Node.js/TypeScript API (Nest.js), Hexagonal Architecture.

## Backend Architecture — Hexagonal (Ports & Adapters)

```
backend/
├── src/
│   ├── domain/                # Pure business logic, no framework dependencies
│   │   ├── entities/          # Product, Stock, Customer, Transaction, Delivery
│   │   ├── value-objects/     # Money, CardNumber, TransactionStatus, etc.
│   │   └── ports/             # Interfaces: ProductRepository, TransactionRepository,
│   │                          # CustomerRepository, DeliveryRepository, PaymentGateway
│   ├── application/           # Use cases (application services)
│   │   ├── create-transaction/
│   │   ├── process-payment/
│   │   ├── update-stock/
│   │   └── assign-delivery/
│   ├── infrastructure/        # Adapters implementing the ports
│   │   ├── persistence/       # PostgreSQL repositories (Prisma)
│   │   ├── payment-gateway/   # Sandbox payment gateway adapter
│   │   └── http/              # Controllers, DTOs, route definitions
│   ├── shared/                # Cross-cutting: Result type (ROP), errors, constants
│   └── main.ts
├── test/                      # Unit + e2e tests (Jest)
└── seed/                      # Dummy product seed script
```

### Layer rules

- `domain/` depends on nothing else in the project.
- `application/` depends only on `domain/` (through ports).
- `infrastructure/` depends on `domain/` and `application/`, implementing the
  ports.
- `http/` controllers call use cases only — zero business logic.

### Railway-Oriented Programming (ROP)

Use cases return a `Result<T, E>` type (`Ok` / `Err`) instead of throwing
exceptions for expected failures (invalid card, insufficient stock, gateway
declined, etc.). Each step of a use case is chained (`map` / `flatMap` /
`andThen`), short-circuiting on the first failure. Exceptions are reserved for
truly unexpected errors.

### Data model (high level)

- **Product**: id, name, description, price, imageUrl
- **Stock**: productId, quantityAvailable
- **Customer**: id, fullName, email, phone
- **Delivery**: id, customerId, address, city, status
- **Transaction**: id, productId, customerId, deliveryId, status (PENDING,
  APPROVED, DECLINED, ERROR), amount, baseFee, deliveryFee, gatewayReference,
  createdAt, updatedAt

### API surface (indicative — finalize in Swagger/Postman)

- `GET /products` — list products with stock
- `GET /products/:id`
- `POST /customers`
- `POST /transactions` — create a PENDING transaction
- `POST /transactions/:id/process` — process the payment, update the result,
  assign the product, update the stock
- `GET /transactions/:id`
- `POST /deliveries`

## Frontend Architecture

```
frontend/
├── src/
│   ├── pages/                 # ProductPage, CheckoutPage, SummaryPage, StatusPage
│   ├── components/            # Presentational, reusable UI components
│   ├── store/                 # Vuex: modules, getters, actions, mutations
│   │   └── transaction/       # Persisted to localStorage (resilience on refresh)
│   ├── services/              # API client (calls to the backend)
│   ├── validators/            # Card number, expiry, CVV, brand detection
│   └── styles/                # Global styles, design tokens
└── test/                      # Jest + Vue Test Utils
```

### State & resilience

Vuex is the single source of truth for the in-progress transaction (selected
product, card/delivery form data minus the raw card number, transaction id,
status). It's persisted to `localStorage` so a page refresh at any of the 5
steps restores progress instead of losing it. CVV and full card numbers are
never persisted.

### Sensitive data handling

Raw card data is only held in memory long enough to submit it; it is never
persisted to `localStorage` or logged. Only the last 4 digits and the card
brand are kept in state after submission, if needed for display.

## Screen flow

1. Product page → 2. Card + delivery info (modal) → 3. Summary (backdrop) →
4. Final status → 5. Back to the product page (stock updated)

## Deployment architecture (reference)

The cloud provider is decided later. The layout is expected to be:

- **Frontend**: static build served over a CDN (e.g. S3 + CloudFront) with
  HTTPS.
- **Backend**: serverless (e.g. Lambda + API Gateway) or a long-running
  container service (e.g. ECS) depending on the chosen provider.
- **Database**: managed PostgreSQL (with Prisma).
- **Secrets** (API keys): environment variables or a secrets manager — never
  committed.

## Security

- HTTPS everywhere.
- Standard security headers (HSTS, X-Content-Type-Options, X-Frame-Options,
  Content-Security-Policy) on backend responses.
- Input validation on every endpoint.
- No sensitive data (full card number, CVV) is ever persisted or logged.
