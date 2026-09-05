# TASKS.md

Granular checklist derived from `MASTER_PLAN.md`. Check items off as they're
completed. Grouped by area; order within a group is roughly execution order.

## Setup
- [ ] Initialize backend project (Nest.js, TypeScript)
- [ ] Initialize frontend project (Vue 3, Vuex, Vite)
- [ ] Configure ESLint + Prettier (backend and frontend)
- [ ] Configure Jest (backend and frontend)
- [ ] Configure Git hooks (lint + test on pre-commit)
- [ ] Create `.env.example` with required variables (no real secrets committed)
- [ ] Write `CONVENTIONS.md`, `ARCHITECTURE.md`, `MASTER_PLAN.md`, `AGENTS.md`
      (this set)

## Backend — Domain & Application
- [x] Define entities: Product, Stock, Customer, Delivery, Transaction
- [x] Define value objects: Money, TransactionStatus, CardBrand
- [x] Define ports: ProductRepository, TransactionRepository,
      CustomerRepository, DeliveryRepository, PaymentGateway
- [x] Implement the Result type for ROP (Ok/Err, map/flatMap/andThen)
- [x] Use case: CreateTransaction (status PENDING)
- [x] Use case: ProcessPayment (calls the gateway, updates status)
- [x] Use case: UpdateStock (on approved payment)
- [x] Use case: AssignDelivery
- [x] Unit tests for every use case (happy path + failure paths)

## Backend — Infrastructure
- [x] PostgreSQL schema/migrations (Prisma)
- [x] Seed script with dummy products
- [x] Repository adapters (Prisma) implementing the domain ports
- [x] Payment gateway sandbox adapter implementing the PaymentGateway port
- [x] REST controllers: products, customers, transactions, deliveries
- [x] Input validation (DTOs) on every endpoint
- [ ] Error handling middleware / consistent error responses
- [ ] Security headers middleware
- [ ] Postman collection or Swagger docs published

## Frontend — Screens
- [ ] Product page (list + stock + price + description)
- [ ] "Pay with credit card" button + modal
- [ ] Card form (number, expiry, CVV, brand detection for Visa/MasterCard)
- [ ] Delivery info form
- [ ] Client-side validation for card and delivery fields
- [ ] Summary screen (product amount + base fee + delivery fee) in a backdrop
- [ ] Pay button → triggers the transaction flow (POST /transactions/:id/process)
- [ ] Final status screen (success/failure)
- [ ] Redirect to the product page with the stock updated

## Frontend — State & Resilience
- [ ] Vuex store for the in-progress transaction
- [ ] Persist relevant (non-sensitive) state to `localStorage`
- [ ] Restore state on page refresh at any step
- [ ] Never persist CVV or full card number
- [ ] API service layer (calls to backend endpoints)

## Testing
- [ ] Backend unit tests ≥ 80% coverage
- [ ] Frontend unit tests ≥ 80% coverage (Jest + Vue Test Utils)
- [ ] Edge cases: insufficient stock, invalid card, declined payment, gateway
      timeout/error, duplicate submission on refresh
- [ ] Record coverage results (for the README)

## Responsive / UI
- [ ] Mobile-first layout, verified at iPhone SE (2020) size (1334×750)
- [ ] Responsive check across common breakpoints
- [ ] Cross-browser sanity check (Chrome, Firefox, Safari)
- [ ] Images optimized for fast load, no overflow/out-of-bounds elements

## Security / Bonus
- [ ] HTTPS enforced in deployment
- [ ] Security headers present (verify with observatory.mozilla.org)
- [ ] No sensitive card data persisted or logged
- [ ] OWASP quick checklist pass

## Deployment
- [ ] Backend deployed (AWS or equivalent)
- [ ] Frontend deployed (AWS or equivalent)
- [ ] Frontend correctly pointed at the deployed backend URL
- [ ] End-to-end smoke test in production

## Documentation & Delivery
- [ ] README.md: setup, architecture summary, data model, API docs link, test
      coverage results, deployment link, environment variables
- [ ] Confirm the payment provider's name appears nowhere in the repo
- [ ] Final commit / tag
- [ ] Repository set to public
