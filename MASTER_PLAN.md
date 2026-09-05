# MASTER_PLAN.md

## Goal

Build and deliver the FullStack Development Test app: a product checkout flow
paid by credit card, including a public product/stock page, a backend API
(stock, transactions, customers, deliveries), automated tests (>80% coverage),
and a cloud deployment — scoring at least 100/100 on the evaluation rubric
below, ideally collecting the bonus points too.

## Non-negotiable constraints

- **Frontend**: SPA in Vue 3 with Vuex and Vite — mobile-first, responsive. No
  other frameworks allowed.
- **Backend**: Node.js/TypeScript with Nest.js — Hexagonal Architecture
  (Ports & Adapters), business logic outside controllers, Railway-Oriented
  Programming (ROP) for use cases. No other frameworks allowed.
- **Database**: PostgreSQL with Prisma ORM, seeded with dummy products (no
  product-creation endpoint is needed).
- **Tests**: Jest, more than 80% coverage, frontend and backend, results
  documented in the README.
- **Deployment**: any cloud provider (decided later).
- **Repository**: public on GitHub, README.md complete, must NOT mention the
  payment provider's name anywhere in the repo.
- **Payment integration**: sandbox only — no real transactions.

## Evaluation rubric (target: 100+/100)

| # | Item | Points |
|---|------|--------|
| 1 | README completed correctly | 5 |
| 2 | Fast-rendering images, no UI/UX overflow | 5 |
| 3 | Full onboarding/checkout functionality | 20 |
| 4 | API working correctly | 20 |
| 5 | >80% unit test coverage (frontend + backend) | 30 |
| 6 | Deployed app + API on a cloud provider | 20 |
| — | **Base total** | **100** |
| B1 | OWASP alignment, HTTPS, security headers | 5 |
| B2 | Fully responsive, cross-browser | 5 |
| B3 | CSS skills | 10 |
| B4 | Clean code | 10 |
| B5 | Hexagonal Architecture / Ports & Adapters | 10 |
| B6 | Railway-Oriented Programming | 10 |
| — | **Bonus total** | **50** |

## Phases

### Phase 0 — Setup & Context (Day 0)
- Initialize the projects: `frontend/` and `backend/` (decide monorepo vs. two
  repos and document the choice in `ARCHITECTURE.md`).
- Write `CONVENTIONS.md`, `ARCHITECTURE.md`, `TASKS.md`, `AGENTS.md` (this set
  of documents).
- Configure linting, formatting, and Git hooks (pre-commit lint + test).
- Configure Jest for both frontend and backend from day one.

### Phase 1 — Backend Foundations
- Define the domain model: Product, Stock, Customer, Transaction, Delivery.
- Define ports (interfaces) for repositories and the payment gateway.
- Implement the database schema (Prisma) and a seed script (dummy products).
- Implement the core use cases with ROP: CreateTransaction, ProcessPayment,
  UpdateStock, AssignDelivery.
- Unit test each use case as it's built.

### Phase 2 — Payment Gateway Integration
- Implement the payment-gateway adapter (sandbox mode) behind the port defined
  in Phase 1.
- Implement the flow: create a PENDING transaction → process the payment →
  update the transaction with the result → assign the product → update the
  stock.
- Test the full payment flow (mock the gateway in unit tests; optionally add a
  controlled integration test against the sandbox).

### Phase 3 — Backend API Surface
- REST endpoints for: products/stock, transactions, customers, deliveries.
- Input validation and error handling on every endpoint (real-world edge cases:
  insufficient stock, invalid card data, gateway timeout, duplicate
  submission).
- Security headers and an HTTPS-ready configuration; pass a basic OWASP
  checklist.
- Publish a Postman collection or a public Swagger URL; document it in the
  README.

### Phase 4 — Frontend Screens (5-step flow)
1. Product page (stock, description, price).
2. Credit card + delivery info modal (validation, card-brand detection).
3. Payment summary (product amount + base fee + delivery fee) in a backdrop
   component, with the pay button.
4. Final status screen (success/failure).
5. Redirect back to the product page with the stock updated.
- Vuex store holding the transaction/session state, persisted to
  `localStorage` so a refresh never loses progress. CVV and full card numbers
  are never persisted.
- Mobile-first responsive layout (minimum reference: iPhone SE 2020,
  1334×750).

### Phase 5 — Testing Hardening
- Push both frontend and backend coverage above 80%.
- Add edge-case tests: failed payment, zero stock, invalid card, network
  error.
- Record the final coverage numbers for the README.

### Phase 6 — Deployment
- Deploy the backend (e.g. AWS Lambda/ECS/EKS or equivalent) and the frontend
  (e.g. S3 + CloudFront or equivalent).
- Wire the deployed frontend to the deployed backend; smoke-test the full flow
  in production.
- Confirm HTTPS is enforced end to end.

### Phase 7 — Documentation & Delivery
- Finalize `README.md`: setup instructions, architecture summary, data model,
  API docs link, test coverage results, deployment link, environment
  variables.
- Final check: no mention of the payment provider's name anywhere in the
  repo.
- Tag the release / final commit.

## Definition of done
- All 6 base rubric items are satisfiable by a reviewer following only the
  README.
- `main` branch is green (build + tests passing).
- The deployed link is reachable and functional end to end.
